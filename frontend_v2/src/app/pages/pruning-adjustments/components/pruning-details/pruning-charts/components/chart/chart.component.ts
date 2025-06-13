import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import {ThresholdService} from '@app/services/threshold.service';

@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('chart') private chartContainer: ElementRef;

  @Input() data: Record<number, number> | null = null;
  @Input() chartTitle: string = '';
  @Input() xAxisLabel: string = 'X Axis';
  @Input() yAxisLabel: string = 'Y Axis';
  @Input() scientificNotation: boolean = false;
  @Input() rounding: number | null = null;

  private margin = { top: 40, right: 30, bottom: 60, left: 80 };
  private tooltip: any;
  private subscription = new Subscription();
  private xScale: d3.ScaleLinear<number, number> | null = null;
  private chartGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private contentHeight: number = 0;

  constructor(
    private readonly thresholdService: ThresholdService
  ) {
  }

  ngOnInit() {
    this.subscription.add(
      this.thresholdService.threshold.asObservable().subscribe((threshold: number) => {
        this.updateThresholdLine(threshold);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }

  ngOnChanges(): void {
    if (!this.data) { return; }

    this.createChart();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chartContainer) {
        this.createChart();
      }
    }, 1);
  }

  onResize() {
    this.createChart();
  }

  private formatYValue(value: number): string {
    if (this.scientificNotation) {
      return value.toExponential(2);
    } else {
      // Apply rounding only if rounding input is provided
      if (this.rounding !== null) {
        return Number(value.toFixed(this.rounding)).toString();
      } else {
        return value.toString();
      }
    }
  }

  private formatXValue(value: number): string {
    // Apply rounding only if rounding input is provided
    if (this.rounding !== null) {
      return Number(value.toFixed(this.rounding)).toString();
    } else {
      return value.toString();
    }
  }

  private createChart(): void {
    if (!this.chartContainer || !this.data) {
      return;
    }

    d3.select(this.chartContainer.nativeElement).select('svg').remove();

    const element = this.chartContainer.nativeElement;

    // Convert Record<number, number> to array of {x, y} objects
    const dataArray = Object.entries(this.data).map(([key, value]) => ({
      x: Number(key),
      y: Number(value)
    })).sort((a, b) => a.x - b.x); // Sort by x value

    if (dataArray.length === 0) {
      return;
    }

    // Create tooltip div if it doesn't exist
    if (!this.tooltip) {
      this.tooltip = d3.select('body').append('div')
        .attr('class', 'chart-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('font-size', '12px')
        .style('z-index', '1000');
    }

    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight)
      .style('background', 'transparent');

    const contentWidth = element.offsetWidth - this.margin.left - this.margin.right;
    const contentHeight = element.offsetHeight - this.margin.top - this.margin.bottom;

    // Set up scales
    const xExtent = d3.extent(dataArray, d => d.x) as [number, number];
    const yExtent = d3.extent(dataArray, d => d.y) as [number, number];

    const x = d3.scaleLinear()
      .range([0, contentWidth])
      .domain(xExtent);

    const y = d3.scaleLinear()
      .range([contentHeight, 0])
      .domain([yExtent[0], yExtent[1] * 1.1]); // Add 10% padding at top

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Store references for threshold line updates
    this.chartGroup = g;
    this.xScale = x;
    this.contentHeight = contentHeight;

    // Add title
    if (this.chartTitle) {
      svg.append('text')
        .attr('x', element.offsetWidth / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .text(this.chartTitle);
    }

    // Add grid lines
    g.append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', `translate(0,${contentHeight})`)
      .call(d3.axisBottom(x)
        .ticks(8)
        .tickSize(-contentHeight)
        .tickFormat(() => ''))
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.3);

    g.append('g')
      .attr('class', 'grid y-grid')
      .call(d3.axisLeft(y)
        .ticks(6)
        .tickSize(-contentWidth)
        .tickFormat(() => ''))
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.3);

    // Create axes with formatted tick labels
    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${contentHeight})`)
      .call(d3.axisBottom(x)
        .ticks(8)
        .tickFormat((d) => this.formatXValue(d as number)));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y)
        .ticks(6)
        .tickFormat((d) => this.formatYValue(d as number)));

    // Add axis labels
    g.append('text')
      .attr('transform', `translate(${contentWidth / 2}, ${contentHeight + 45})`)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text(this.xAxisLabel);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -contentHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text(this.yAxisLabel);

    // Define the line generator
    const line = d3.line<{x: number, y: number}>()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);

    // Add the line path
    g.append('path')
      .datum(dataArray)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add data points as circles
    g.selectAll('.dot')
      .data(dataArray)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 2)
      .style('fill', 'steelblue')
      .style('cursor', 'pointer');

    // Mouse interaction setup
    const mouseG = g.append('g')
      .attr('class', 'mouse-over-effects');

    const mouseLine = mouseG.append('path')
      .attr('class', 'mouse-line')
      .style('opacity', '0')
      .style('stroke', '#666')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3');

    // Overlay for mouse tracking
    mouseG.append('rect')
      .attr('width', contentWidth)
      .attr('height', contentHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', () => {
        mouseLine.style('opacity', '0');
        this.tooltip.transition()
          .duration(300)
          .style('opacity', 0);

        g.selectAll('.dot')
          .transition()
          .duration(200)
          .attr('r', 2);
      })
      .on('mousemove', (event) => {
        const mouse = d3.pointer(event);
        const mouseX = mouse[0];
        const xValue = x.invert(mouseX);

        // Find closest data point
        const bisect = d3.bisector((d: {x: number, y: number}) => d.x).left;
        const i = bisect(dataArray, xValue, 1);
        const d0 = dataArray[i - 1];
        const d1 = dataArray[i] || d0;

        if (!d0 && !d1) return;

        const d = !d1 ? d0 : !d0 ? d1 :
          Math.abs(xValue - d0.x) < Math.abs(xValue - d1.x) ? d0 : d1;

        if (d) {
          const snappedX = x(d.x);

          mouseLine
            .style('opacity', '1')
            .attr('d', `M${snappedX},${contentHeight} ${snappedX},0`);

          // Show tooltip with formatted values
          this.tooltip.transition()
            .duration(100)
            .style('opacity', 0.9);

          this.tooltip.html(`
            <div><strong>${this.xAxisLabel}:</strong> ${this.formatXValue(d.x)}</div>
            <div><strong>${this.yAxisLabel}:</strong> ${this.formatYValue(d.y)}</div>
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 40) + 'px');
        }
      });

    this.addThresholdLine();
  }

  private addThresholdLine(): void {
    if (!this.chartGroup) return;

    // Remove existing threshold line
    this.chartGroup.select('.threshold-line').remove();

    // Add threshold line
    this.chartGroup.append('line')
      .attr('class', 'threshold-line')
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('x1', this.xScale!(this.thresholdService.Threshold))
      .attr('y1', 0)
      .attr('x2', this.xScale!(this.thresholdService.Threshold))
      .attr('y2', this.contentHeight);
  }

  private updateThresholdLine(threshold: number): void {
    if (!this.chartGroup || !this.xScale) return;

    const thresholdLine = this.chartGroup.select('.threshold-line');

    if (thresholdLine.empty()) {
      this.addThresholdLine();
      return this.updateThresholdLine(threshold);
    }

    // Calculate x position for the threshold
    const xPosition = this.xScale(threshold);

    // Update line position
    thresholdLine
      .attr('x1', xPosition)
      .attr('y1', 0)
      .attr('x2', xPosition)
      .attr('y2', this.contentHeight);
  }
}
