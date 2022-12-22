import * as d3 from 'd3';
import {NumberValue, ScaleLinear} from 'd3';
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

type buildBarChartType = {
	marginTop?: number;
	marginRight?: number;
	marginBottom?: number;
	marginLeft?: number;
	width?: number;
	height?: number;
	xType?: <Range, Output = Range, Unknown = never>(
		domain: Iterable<NumberValue>,
		range: Iterable<Range>
	) => ScaleLinear<Range, Output, Unknown>;
	xDomain?: [number, number] | [number, undefined];
	xRange?: [number, number];
	xFormat?: string;
	xLabel?: string;
	yPadding?: number;
	yDomain?: string[];
	yRange?: [number, number];
	color?: string;
	titleColor?: string;
	titleAltColor?: string;
};
type BarChartGraphProps = {
	nbOfCountPerParticipants: {participant: string; nbMessage: number}[];
	width?: number;
	height?: number;
};

function buildBarChartGraph(
	ref: React.MutableRefObject<null>,
	data: {participant: string; nbMessage: number}[],
	{
		marginTop = 50, // The top margin, in pixels
		marginRight = 10, // The right margin, in pixels
		marginBottom = 10, // The bottom margin, in pixels
		marginLeft = 120, // The left margin, in pixels
		width = 640, // The outer width of the chart, in pixels
		height = 200, // Outer height, in pixels
		xType = d3.scaleLinear, // Type of x-scale
		xDomain, // [xmin, xmax]
		xRange = [marginLeft, width - marginRight], // [left, right]
		xFormat, // A format specifier string for the x-axis
		xLabel = 'Default xLabel', // A label for the x-axis
		yPadding = 0.1, // Amount of y-range to reserve to separate bars
		yDomain, // An array of (ordinal) y-values
		yRange, // [top, bottom]
		color = 'currentColor', // Bar fill color
		titleColor = 'white', // Title fill color when atop bar
		titleAltColor = 'currentColor', // Title fill color when atop background
	}: buildBarChartType
) {
	// Compute values.
	const X = data.map(({nbMessage}) => nbMessage);
	const Y = data.map(({participant}) => participant);

	// Compute default domains, and unique the y-domain.
	if (xDomain === undefined) xDomain = [0, d3.max(X)];
	if (yDomain === undefined) yDomain = Y;
	const yDomainSet = new d3.InternSet(yDomain);
	if (!xDomain || (xDomain && !xDomain[1]))
		throw new Error('invalid value for xDomain');

	// Omit any data not present in the y-domain.
	const I = d3.range(X.length).filter((i) => yDomainSet.has(Y[i]));

	// Compute the default height.
	if (height === undefined)
		height =
			Math.ceil((yDomainSet.size + yPadding) * 25) + marginTop + marginBottom;
	if (yRange === undefined) yRange = [marginTop, height - marginBottom];

	// Construct scales and axes.
	const xScale = xType(xDomain, xRange);
	const yScale = d3.scaleBand(yDomainSet, yRange).padding(yPadding);
	const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat);
	const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

	// Compute titles.
	const formatValue = xScale.tickFormat(100, xFormat);
	const title = (i: number) => `${formatValue(X[i])}`;

	const svg = d3
		.select(ref.current)
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

	svg
		.append('g')
		.attr('transform', `translate(0,${marginTop})`)
		.attr('style', 'font-size: large')
		.call(xAxis)
		.call((g) => g.select('.domain').remove())
		.call((g) =>
			g
				.selectAll('.tick line')
				.clone()
				.attr('y2', height - marginTop - marginBottom)
				.attr('stroke-opacity', 0.1)
		)
		.call((g) =>
			g
				.append('text')
				.attr('x', width - marginRight)
				.attr('y', -32)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'end')
				.text(xLabel)
		);

	svg
		.append('g')
		.attr('fill', color)
		.selectAll('rect')
		.data(I)
		.join('rect')
		.attr('x', xScale(0))
		.attr('y', (i) => yScale(Y[i]) as number)
		.attr('width', (i) => xScale(X[i]) - xScale(0))
		.attr('height', yScale.bandwidth())
		.attr('style', 'font-size: large')
		.attr('id', 'graphBars');

	svg
		.append('g')
		.attr('fill', titleColor)
		.attr('text-anchor', 'end')
		.attr('font-family', 'sans-serif')
		.attr('font-size', 'large')
		.selectAll('text')
		.data(I)
		.join('text')
		.attr('x', (i) => xScale(X[i]))
		.attr('y', (i) => (yScale(Y[i]) as number) + yScale.bandwidth() / 2)
		.attr('dy', '0.35em')
		.attr('dx', -4)
		.attr('id', 'graphNumbers')
		.text(title)
		.call((text) =>
			text
				.filter((i) => xScale(X[i]) - xScale(0) < 20) // Short bars
				.attr('dx', +4)
				.attr('fill', titleAltColor)
				.attr('text-anchor', 'start')
		);

	svg
		.append('g')
		.attr('transform', `translate(${marginLeft},0)`)
		.call(yAxis)
		.attr('font-size', 'large');
}

export const BarChartGraph = ({
	nbOfCountPerParticipants,
	width,
	height,
}: BarChartGraphProps) => {
	const ref = React.useRef(null);
	const frame = useCurrentFrame();

	const barsVisibility = interpolate(frame, [45, 200], [0, 100], {
		extrapolateRight: 'clamp',
	});
	const numbersVisibility = interpolate(frame, [200, 215], [0, 100], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const updateGraph = (barVisibility: number, numbersVisibility: number) => {
		d3.selectAll('#graphBars').attr(
			'clip-path',
			() =>
				`polygon(0% 0%, ${barVisibility}% 0%, ${barVisibility}% 100%, 0% 100%)`
		);
		d3.selectAll('#graphNumbers').attr(
			'clip-path',
			() =>
				`polygon(0% 0%, ${numbersVisibility}% 0%, ${numbersVisibility}% 100%, 0% 100%)`
		);
	};

	React.useEffect(() => {
		buildBarChartGraph(ref, nbOfCountPerParticipants, {
			yDomain: d3.groupSort(
				nbOfCountPerParticipants,
				([d]) => -d.nbMessage,
				(d) => d.participant
			), // Sort by descending frequency
			width,
			height,
			xLabel: 'Nombre de message',
			color: 'steelblue',
		});
	}, [height, nbOfCountPerParticipants, width]);

	React.useEffect(() => {
		updateGraph(barsVisibility, numbersVisibility);
	}, [barsVisibility, numbersVisibility]);

	return <svg ref={ref} />;
};
