import * as d3 from 'd3';
import {NumberValue, ScaleLinear, ScaleTime} from 'd3';
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

type buildLineChartGraphType = {
	defined?: (d: unknown, i: number) => boolean;
	curve?: d3.CurveFactory;
	marginTop?: number;
	marginRight?: number;
	marginBottom?: number;
	marginLeft?: number;
	width?: number;
	height?: number;
	xType?: <Range, Output = Range, Unknown = never>(
		domain: Iterable<NumberValue>,
		range: Iterable<Range>
	) => ScaleTime<Range, Output, Unknown>;
	xDomain?: [Date, Date] | [undefined, undefined] | undefined;
	xRange?: [number, number];
	yType?: <Range, Output = Range, Unknown = never>(
		domain: Iterable<NumberValue>,
		range: Iterable<Range>
	) => ScaleLinear<Range, Output, Unknown>;
	yDomain?: [number, number] | [number, undefined] | undefined;
	yRange?: [number, number];
	yFormat?: string;
	yLabel?: string;
	color?: string;
	strokeLinecap?: string;
	strokeLinejoin?: string;
	strokeWidth?: number;
	strokeOpacity?: number;
};
type LineChartGraphProps = {
	numberOfCumulatedMessagesPerDay: {date: Date; valeur: number}[];
	width?: number;
	height?: number;
};

function buildLineChartGraph(
	ref: React.MutableRefObject<null>,
	data: Array<{date: Date; valeur: number}>,
	{
		defined, // For gaps in data
		curve = d3.curveLinear, // Method of interpolation between points
		marginTop = 30, // Top margin, in pixels
		marginRight = 30, // Right margin, in pixels
		marginBottom = 30, // Bottom margin, in pixels
		marginLeft = 70, // Left margin, in pixels
		width = 640, // Outer width, in pixels
		height = 400, // Outer height, in pixels
		xType = d3.scaleUtc, // The x-scale type
		xDomain, // [xmin, xmax]
		xRange = [marginLeft, width - marginRight], // [left, right]
		yType = d3.scaleLinear, // The y-scale type
		yDomain, // [ymin, ymax]
		yRange = [height - marginBottom, marginTop], // [bottom, top]
		yFormat, // A format specifier string for the y-axis
		yLabel = 'Axe des ordonnées', // A label for the y-axis
		color = 'currentColor', // Stroke color of line
		strokeLinecap = 'round', // Stroke line cap of the line
		strokeLinejoin = 'round', // Stroke line join of the line
		strokeWidth = 1.5, // Stroke width of line, in pixels
		strokeOpacity = 1, // Stroke opacity of line
	}: buildLineChartGraphType
) {
	// Compute values.
	const X = data.map(({date}) => date);
	const Y = data.map(({valeur}) => valeur);
	const I = d3.range(X.length);
	if (defined === undefined)
		defined = (d: unknown, i: number) =>
			!isNaN(X[i] as unknown as number) && !isNaN(Y[i]);
	const D = data.map(defined);

	// Compute default domains.
	if (xDomain === undefined) xDomain = d3.extent(X);
	if (yDomain === undefined) yDomain = [0, d3.max(Y)];
	// --- Wtf ?
	if (!xDomain[0] && !xDomain[1]) throw new Error('invalid xDomain value');
	if (!yDomain || (yDomain && !yDomain[1]))
		throw new Error('invalid yDomain value');
	// --- Wtf ?

	// Construct scales and axes.
	const xScale = xType(xDomain, xRange);
	const yScale = yType(yDomain, yRange);
	const xAxis = d3
		.axisBottom(xScale)
		.ticks(width / 80)
		.tickSizeOuter(0);
	const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

	// Construct a line generator.
	const line = d3
		.line<number>()
		.defined((i) => D[i])
		.curve(curve)
		.x((i) => xScale(X[i]))
		.y((i) => yScale(Y[i]));

	const svg = d3
		.select(ref.current)
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.attr(
			'style',
			'max-width: 100%; height: auto; height: intrinsic; font-size: 80;'
		);

	svg
		.append('g')
		.attr('transform', `translate(0,${height - marginBottom})`)
		.attr('style', 'font-size: large')
		.call(xAxis);

	svg
		.append('g')
		.attr('transform', `translate(${marginLeft},0)`)
		.attr('style', 'font-size: large')
		.call(yAxis)
		.call((g) => g.select('.domain').remove())
		.call((g) =>
			g
				.selectAll('.tick line')
				.clone()
				.attr('x2', width - marginLeft - marginRight)
				.attr('stroke-opacity', 0.1)
		)
		.call((g) =>
			g
				.append('text')
				.attr('x', -marginLeft)
				.attr('y', 17)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'start')
				.text(yLabel)
		);

	svg
		.append('path')
		.attr('id', 'graphLine')
		.attr('fill', 'none')
		.attr('stroke', color)
		.attr('stroke-width', strokeWidth)
		.attr('stroke-linecap', strokeLinecap)
		.attr('stroke-linejoin', strokeLinejoin)
		.attr('stroke-opacity', strokeOpacity)
		.attr('d', line(I));
}

export const LineChartGraph = ({
	numberOfCumulatedMessagesPerDay,
	width,
	height,
}: LineChartGraphProps) => {
	const ref = React.useRef(null);
	const frame = useCurrentFrame();

	const lineVisibility = interpolate(frame, [45, 200], [0, 100], {
		extrapolateRight: 'clamp',
		extrapolateLeft: 'clamp',
	});

	const updateGraph = (barVisibility: number) => {
		d3.select('#graphLine').attr(
			'clip-path',
			() =>
				`polygon(0% 0%, ${barVisibility}% 0%, ${barVisibility}% 100%, 0% 100%)`
		);
	};

	React.useEffect(() => {
		buildLineChartGraph(ref, numberOfCumulatedMessagesPerDay, {
			yLabel: 'Nombre de message cumulé',
			width,
			height,
			color: 'steelblue',
			strokeWidth: 4,
		});
	}, [height, numberOfCumulatedMessagesPerDay, width]);

	React.useEffect(() => {
		updateGraph(lineVisibility);
	}, [lineVisibility]);

	return <svg ref={ref} />;
};
