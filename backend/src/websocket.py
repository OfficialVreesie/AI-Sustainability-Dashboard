import os
import json
import asyncio
import copy
import pandas as pd
from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from typing import Dict, List

from loading import load_huggingface_model, load_local_model
from preprocess import disable_low_weight_neurons
from benchmark import evaluate_model
from predict import predict_with_auto_regressive_model

UPLOAD_DIR = "uploads"


THRESHOLDS = [i * 0.1 for i in range(1, 100)]

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, upload_id: str):
        await websocket.accept()
        if upload_id not in self.active_connections:
            self.active_connections[upload_id] = []
        self.active_connections[upload_id].append(websocket)

    def disconnect(self, websocket: WebSocket, upload_id: str):
        if upload_id in self.active_connections:
            self.active_connections[upload_id].remove(websocket)
            if not self.active_connections[upload_id]:
                del self.active_connections[upload_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_message_to_upload(self, message: str, upload_id: str):
        if upload_id in self.active_connections:
            for connection in self.active_connections[upload_id]:
                try:
                    await connection.send_text(message)
                except:
                    # Remove dead connections
                    self.active_connections[upload_id].remove(connection)

    async def broadcast_to_upload(self, data: dict, upload_id: str):
        message = json.dumps(data)
        await self.send_message_to_upload(message, upload_id)

manager = ConnectionManager()

def validate_upload_id(upload_id: str) -> bool:
    if not upload_id:
        return False
    
    # Check if directory exists
    upload_path = os.path.join(UPLOAD_DIR, upload_id)
    if not os.path.exists(upload_path):
        return False
    
    # Additional validation: check if it matches the expected format (timestamp_randomid)
    try:
        parts = upload_id.split('_')
        if len(parts) != 2:
            return False
        
        random_id = int(parts[1])
        if not (1000 <= random_id <= 9999):
            return False
        
        return True
    except (ValueError, IndexError):
        return False

async def websocket_endpoint(websocket: WebSocket, upload_id: str):
    if not validate_upload_id(upload_id):
        await websocket.close(code=4001, reason="Invalid upload_id")
        return
    
    await manager.connect(websocket, upload_id)
    
    # Send initial connection confirmation
    await manager.send_personal_message(
        json.dumps({
            "type": "connection",
            "status": "connected",
            "upload_id": upload_id,
            "message": "WebSocket connection established"
        }),
        websocket
    )
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await manager.send_personal_message(
                        json.dumps({"type": "pong", "timestamp": message.get("timestamp")}),
                        websocket
                    )
                elif message.get("type") == "start":
                    await notify_model_loading(upload_id)

                    df = pd.read_csv(os.path.join(UPLOAD_DIR, upload_id, "dataset.csv"))

                    if has_huggingface_url(upload_id):
                        huggingface_url = get_huggingface_url(upload_id)
                        if huggingface_url:
                            model, tokenizer = load_huggingface_model(huggingface_url)
                            model_copy = copy.deepcopy(model)
                            pruned_model, model_info = disable_low_weight_neurons(model_copy, 10)

                            await notify_benchmark_start(upload_id, progress=30)

                            begin_time = pd.Timestamp.now()
                            metrics_baseline = evaluate_model(model, tokenizer, df)
                            end_time = pd.Timestamp.now()
                            print(f"Benchmarking basesline took {end_time - begin_time} seconds")
                            print("Baseline metrics:", metrics_baseline)

                            await notify_benchmark_start(upload_id, progress=50)

                            begin_time = pd.Timestamp.now()
                            metrics_pruned = evaluate_model(pruned_model, tokenizer, df)
                            end_time = pd.Timestamp.now()
                            print(f"Benchmarking pruned model took {end_time - begin_time} seconds")
                            print("Pruned metrics:", metrics_pruned)

                            await notify_pre_pruning(upload_id, progress=70)

                            pruned_threshold_data = {
                                0: {
                                    "accuracy": metrics_baseline['overall_accuracy'],
                                    "flops": model_info['original']['flops_estimate'],
                                    "non_zero_params": model_info['original']['non_zero_params'],
                                    "params_reduction_pct": model_info['after_pruning']['params_reduction_pct'],
                                    "flops_reduction_pct": model_info['after_pruning']['flops_reduction_pct']
                                },
                                10: {
                                    "accuracy": metrics_pruned['overall_accuracy'],
                                    "flops": model_info['after_pruning']['flops_estimate'],
                                    "non_zero_params": model_info['after_pruning']['non_zero_params'],
                                    "params_reduction_pct": model_info['after_pruning']['params_reduction_pct'],
                                    "flops_reduction_pct": model_info['after_pruning']['flops_reduction_pct']
                                }
                            }

                            for threshold in THRESHOLDS:
                                # Round threshold to 1 decimal place if it has more than one decimal
                                threshold = round(threshold, 1)

                                model_copy = copy.deepcopy(model)
                                pruned_model, metrics = disable_low_weight_neurons(model_copy, threshold)
                                
                                pruned_threshold_data[threshold] = {
                                    "accuracy": 0,
                                    "flops": metrics['after_pruning']['flops_estimate'],
                                    "non_zero_params": metrics['after_pruning']['non_zero_params'],
                                    "params_reduction_pct": metrics['after_pruning']['params_reduction_pct'],
                                    "flops_reduction_pct": metrics['after_pruning']['flops_reduction_pct']
                                }
                                
                                del model_copy

                            await notify_predicting_performance(upload_id, progress=90)

                            pruned_threshold_data = predict_with_auto_regressive_model(pruned_threshold_data, "accuracy")

                            # Save the pruned threshold data to a file
                            pruned_threshold_path = os.path.join(UPLOAD_DIR, upload_id, "pruned_threshold_data.json")
                            with open(pruned_threshold_path, "w") as f:
                                json.dump(pruned_threshold_data, f, indent=4)
                            
                            await notify_benchmark_complete(upload_id)
                    
                    else:
                        model_path = get_model_path(upload_id)
                        if model_path:
                            model = load_local_model(model_path)

                else:
                    await manager.send_personal_message(
                        json.dumps({"type": "error", "message": "Unknown message type"}),
                        websocket
                    )
                    
            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({"type": "error", "message": "Invalid JSON format"}),
                    websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, upload_id)
        print(f"Client disconnected from upload_id: {upload_id}")
    except Exception as e:
        print(f"WebSocket error for upload_id {upload_id}: {str(e)}")
        manager.disconnect(websocket, upload_id)

def has_huggingface_url(upload_id: str) -> bool:
    upload_path = os.path.join(UPLOAD_DIR, upload_id)
    huggingface_path = os.path.join(upload_path, "huggingface_url.txt")
    
    if not os.path.exists(huggingface_path):
        return False
    
    with open(huggingface_path, "r") as f:
        url = f.read().strip()
    
    return bool(url) and url.lower() != 'none'

def get_huggingface_url(upload_id: str) -> str:
    upload_path = os.path.join(UPLOAD_DIR, upload_id)
    huggingface_path = os.path.join(upload_path, "huggingface_url.txt")
    
    if not os.path.exists(huggingface_path):
        return None
    
    with open(huggingface_path, "r") as f:
        url = f.read().strip()
    
    return url if url else None

def get_model_path(upload_id: str) -> str:
    upload_path = os.path.join(UPLOAD_DIR, upload_id)
    model_files = [f for f in os.listdir(upload_path) if f.endswith(('.h5', '.keras'))]
    
    if not model_files:
        return None
    
    return os.path.join(upload_path, model_files[0])

async def notify_model_loading(upload_id: str):
    await manager.broadcast_to_upload({
        "type": "loading",
        "progress": 20,
        "message": "Model is being loaded...",
        "upload_id": upload_id
    }, upload_id)

async def notify_pre_pruning(upload_id: str, progress: int = 0):
    await manager.broadcast_to_upload({
        "type": "loading",
        "progress": progress,
        "message": "Collecting pruning data...",
        "upload_id": upload_id
    }, upload_id)

async def notify_benchmark_start(upload_id: str, progress: int = 0):
    await manager.broadcast_to_upload({
        "type": "loading",
        "progress": progress,
        "message": "Benchmarking model...",
        "upload_id": upload_id
    }, upload_id)

async def notify_predicting_performance(upload_id: str, progress: int = 0):
    await manager.broadcast_to_upload({
        "type": "loading",
        "progress": progress,
        "message": "Predicting performance...",
        "upload_id": upload_id
    }, upload_id)

async def notify_benchmark_complete(upload_id: str):
    await manager.broadcast_to_upload({
        "type": "complete",
        "progress": 100,
        "message": "Benchmark completed successfully",
        "upload_id": upload_id
    }, upload_id)