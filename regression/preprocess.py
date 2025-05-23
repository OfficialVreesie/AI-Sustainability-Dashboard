import torch

def preprocess(text):
    new_text = []
    for t in text.split(" "):
        t = '@user' if t.startswith('@') and len(t) > 1 else t
        t = 'http' if t.startswith('http') else t
        new_text.append(t)
    return " ".join(new_text)

def count_layers(model):
    """Count the number of layers in a model"""
    return len([name for name, param in model.named_parameters() if 'layer' in name])

def count_non_zero_params(model):
    """Count non-zero parameters in a model"""
    total_params = 0
    non_zero_params = 0
    
    for name, param in model.named_parameters():
        if param.requires_grad:
            total_params += param.numel()
            non_zero_params += (param.data != 0).sum().item()
    
    return non_zero_params, total_params

def estimate_flops(model, seq_length=128):
    """Estimate FLOPs for a transformer model"""
    config = model.config
    hidden_size = getattr(config, 'hidden_size', 768)
    num_layers = getattr(config, 'num_hidden_layers', 12)
    num_attention_heads = getattr(config, 'num_attention_heads', 12)
    
    # Estimate FLOPs for one forward pass
    # This is a simplified estimation
    flops_per_token = 0
    
    # Self-attention operations
    flops_per_token += 4 * num_layers * hidden_size * hidden_size  # Query, key, value, output projections
    flops_per_token += 2 * num_layers * seq_length * hidden_size  # QK attention
    
    # FFN operations
    ffn_dim = getattr(config, 'intermediate_size', 4 * hidden_size)
    flops_per_token += 2 * num_layers * hidden_size * ffn_dim  # Two linear layers in FFN
    
    # Multiply by sequence length
    total_flops = flops_per_token * seq_length
    
    # Adjust for sparsity
    non_zero_params, total_params = count_non_zero_params(model)
    sparsity_ratio = non_zero_params / total_params if total_params > 0 else 0
    
    # Adjust FLOPs based on sparsity (this is a simplification)
    adjusted_flops = total_flops * sparsity_ratio
    
    return adjusted_flops, total_flops

def disable_low_weight_neurons(model, threshold_percentage=0.5):
    """
    Disable low-weight neurons in a model and report metrics before and after.
    
    Args:
        model: The PyTorch model
        threshold_percentage: The percentage threshold for pruning (0-100)
        
    Returns:
        tuple: (modified model, metrics dictionary)
    """
    # Get original metrics
    original_number_of_layers = count_layers(model)
    original_non_zero_params, original_total_params = count_non_zero_params(model)
    original_flops_estimate, original_total_flops = estimate_flops(model)
    
    print(f"Original metrics:")
    print(f"Number of layers: {original_number_of_layers}")
    print(f"Parameters: {original_non_zero_params:,}/{original_total_params:,} ({original_non_zero_params/original_total_params*100:.2f}%)")
    print(f"Estimated FLOPs: {original_flops_estimate:,.0f}")
    
    # Disable low-weight neurons
    for name, param in model.named_parameters():
        if 'weight' in name and len(param.shape) > 1:
            max_weight = torch.abs(param.data).max().item()
            threshold = max_weight * (threshold_percentage / 100)
            
            mask = torch.abs(param.data) >= threshold
            param.data[~mask] = 0.0
    
    # Get metrics after pruning
    pruned_non_zero_params, pruned_total_params = count_non_zero_params(model)
    pruned_flops_estimate, pruned_total_flops = estimate_flops(model)
    
    print(f"\nAfter pruning (threshold: {threshold_percentage}%):")
    print(f"Parameters: {pruned_non_zero_params:,}/{pruned_total_params:,} ({pruned_non_zero_params/pruned_total_params*100:.2f}%)")
    print(f"Estimated FLOPs: {pruned_flops_estimate:,.0f}")
    print(f"Reduction in parameters: {(1 - pruned_non_zero_params/original_non_zero_params)*100:.2f}%")
    print(f"Reduction in FLOPs: {(1 - pruned_flops_estimate/original_flops_estimate)*100:.2f}%")
    
    return model, {
        "original": {
            "total_layers": original_number_of_layers,
            "non_zero_params": original_non_zero_params,
            "total_params": original_total_params,
            "flops_estimate": original_flops_estimate
        },
        "after_pruning": {
            "non_zero_params": pruned_non_zero_params,
            "total_params": pruned_total_params,
            "flops_estimate": pruned_flops_estimate,
            "params_reduction_percentage": (1 - pruned_non_zero_params/original_non_zero_params)*100,
            "flops_reduction_percentage": (1 - pruned_flops_estimate/original_flops_estimate)*100
        }
    }