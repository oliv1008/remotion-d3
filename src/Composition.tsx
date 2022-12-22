import * as d3 from 'd3';
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

export const MyComposition = () => {
	const ref = React.useRef(null);
	const frame = useCurrentFrame();

	const buildGraph = (data: Array<number>) => {
		const width = 200;
		const scaleFactor = 10;
		const barHeight = 20;

		const graph = d3
			.select(ref.current)
			.attr('width', width)
			.attr('height', barHeight * data.length);

		const bar = graph
			.selectAll('g')
			.data(data)
			.enter()
			.append('g')
			.attr('transform', (d, i) => {
				return `translate(0, ${i * barHeight})`;
			});

		bar
			.append('rect')
			.attr('width', (d) => {
				return d * scaleFactor;
			})
			.attr('height', barHeight - 1);

		bar
			.append('text')
			.attr('x', (d) => {
				return d * scaleFactor;
			})
			.attr('y', barHeight / 2)
			.attr('dy', '.35em')
			.text((d) => {
				return d;
			});
	};

	const barVisibility = interpolate(frame, [0, 30], [0, 100], {
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.76, 0, 0.24, 1),
	});

	const updateGraph = (barVisibility: number) => {
		d3.selectAll('g').attr(
			'clip-path',
			() =>
				`polygon(0% 0%, ${barVisibility}% 0%, ${barVisibility}% 100%, 0% 100%)`
		);
	};

	React.useEffect(() => {
		buildGraph([5, 10, 12]);
	}, []);

	React.useEffect(() => {
		updateGraph(barVisibility);
	}, [barVisibility]);

	return <svg ref={ref} />;
};
