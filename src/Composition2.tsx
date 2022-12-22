import {Audio, interpolate} from 'remotion';
import * as d3 from 'd3';
import {AbsoluteFill, Series, staticFile} from 'remotion';
import {Animated, Fade, Scale} from 'remotion-animated';
import messagesRepairedJSON from '../input/messages_combined@1.json';
import {BarChartGraph} from './Composition2/BarChartGraph';
import {LineChartGraph} from './Composition2/LineChartGraph';

export const FONT_FAMILY = 'SF Pro Text, Helvetica, Arial, sans-serif';

const messagesRepaired: {
	participants: {name: string}[];
	messages: {
		sender_name: string;
		timestamp_ms: Date;
		content?: string;
		type: string;
		is_unsent: boolean;
	}[];
} = JSON.parse(JSON.stringify(messagesRepairedJSON));
const numberOfMessagesPerDay = d3.rollup(
	messagesRepaired.messages,
	(v) => v.length,
	(d) => new Date(d.timestamp_ms).toDateString()
);
const numberOfCumulatedMessagesPerDay = (() => {
	// Start the running count at zero.
	let runningCount = 0;
	const numberOfCumulatedMessagesPerDay: {date: Date; valeur: number}[] = [];
	// Loop through all the dates in the current filtered Tweet list
	numberOfMessagesPerDay.forEach((value, key) => {
		// Add each day's tally to the running count
		runningCount += value;
		// Return a new datum for this date with the cumulative tally instead of that day's count.
		const numberOfCumulatedMessagesToday = {
			date: new Date(key),
			valeur: runningCount,
		};
		numberOfCumulatedMessagesPerDay.push(numberOfCumulatedMessagesToday);
	});

	return numberOfCumulatedMessagesPerDay;
})();
const nbOfCountPerParticipants = (() => {
	const nbOfCountPerParticipants: {participant: string; nbMessage: number}[] =
		[];

	messagesRepaired.participants.forEach((participant) => {
		nbOfCountPerParticipants.push({
			participant: participant.name,
			nbMessage: 0,
		});
	});

	messagesRepaired.messages.forEach((message) => {
		if (message.content && message.content.match(/\d/)) {
			const index = nbOfCountPerParticipants.findIndex(
				(value) => value.participant === message.sender_name
			);
			if (index === -1) {
				nbOfCountPerParticipants.push({
					participant: message.sender_name,
					nbMessage: 1,
				});
			} else {
				nbOfCountPerParticipants[index].nbMessage += 1;
			}
		}
	});

	return nbOfCountPerParticipants
		.filter((element) => element.nbMessage > 0)
		.sort((a, b) => b.nbMessage - a.nbMessage)
		.slice(0, 5);
})();
const startDateConv = new Date(messagesRepaired.messages[0].timestamp_ms);
const endDateConv = new Date(
	messagesRepaired.messages[messagesRepaired.messages.length - 1].timestamp_ms
);
const bestSender: {name: string; quantity: number} = {
	name: nbOfCountPerParticipants[0].participant,
	quantity: nbOfCountPerParticipants[0].nbMessage,
};

export const MyComposition2 = () => {
	return (
		<AbsoluteFill
			style={{backgroundColor: 'whitesmoke', fontFamily: FONT_FAMILY}}
		>
			<Audio
				src={staticFile('Mr Smith - Sweet n Dirty.mp3')}
				volume={(f) =>
					interpolate(f, [0, 39 * 30, 44 * 30], [0.1, 0.1, 0], {
						extrapolateRight: 'clamp',
					})
				}
			/>
			<Series>
				<Series.Sequence
					durationInFrames={5 * 30}
					style={{alignItems: 'center', justifyContent: 'center'}}
				>
					<Animated
						animations={[
							Fade({initial: 0, to: 1, duration: 10}),
							Scale({by: 1, initial: 20}),
							Fade({to: 0, start: 4 * 30}),
						]}
						style={{
							width: 'fit-content',
							height: 'fit-content',
							fontSize: 80,
							textAlign: 'center',
						}}
					>
						Analyse d'une conversation Messenger
					</Animated>
				</Series.Sequence>
				<Series.Sequence
					durationInFrames={8 * 30}
					style={{alignItems: 'center', justifyContent: 'center'}}
				>
					<Animated
						animations={[
							Fade({initial: 0, to: 1, duration: 10}),
							Scale({by: 1, initial: 20}),
							Fade({to: 0, start: 7 * 30}),
						]}
						style={{
							width: 'fit-content',
							height: 'fit-content',
							fontSize: 80,
							textAlign: 'center',
							padding: '0px 10px',
						}}
					>
						{`Du ${startDateConv.toLocaleDateString()} au ${endDateConv.toLocaleDateString()} c'est un total de ${new Intl.NumberFormat().format(
							messagesRepaired.messages.length
						)} messages qui ont été envoyés !`}
					</Animated>
				</Series.Sequence>
				<Series.Sequence
					durationInFrames={12 * 30}
					style={{alignItems: 'center', justifyContent: 'center'}}
				>
					<Animated
						animations={[
							Fade({initial: 0, to: 1}),
							Fade({to: 0, start: 11 * 30}),
						]}
						style={{
							alignItems: 'center',
							justifyContent: 'space-between',
							display: 'flex',
							flexDirection: 'column',
							height: '100%',
							padding: '20px 0px',
						}}
					>
						<div
							style={{
								width: 'fit-content',
								height: 'fit-content',
								fontSize: 80,
								textAlign: 'center',
								padding: '0px 10px',
							}}
						>
							Regardez l'évolution !
						</div>
						<LineChartGraph
							numberOfCumulatedMessagesPerDay={numberOfCumulatedMessagesPerDay}
							width={1200}
							height={500}
						/>
					</Animated>
				</Series.Sequence>
				<Series.Sequence
					durationInFrames={8 * 30}
					style={{alignItems: 'center', justifyContent: 'center'}}
				>
					<Animated
						animations={[
							Fade({initial: 0, to: 1, duration: 10}),
							Scale({by: 1, initial: 20}),
							Fade({to: 0, start: 7 * 30}),
						]}
						style={{
							width: 'fit-content',
							height: 'fit-content',
							fontSize: 80,
							textAlign: 'center',
							padding: '0px 10px',
						}}
					>
						{`Félicitation à ${
							bestSender.name
						} pour être le plus actif du groupe avec ${new Intl.NumberFormat().format(
							bestSender.quantity
						)} messages à son actif !`}
					</Animated>
				</Series.Sequence>
				<Series.Sequence
					durationInFrames={12 * 30}
					style={{alignItems: 'center', justifyContent: 'center'}}
				>
					<Animated
						animations={[
							Fade({initial: 0, to: 1}),
							Fade({to: 0, start: 11 * 30}),
						]}
						style={{
							alignItems: 'center',
							justifyContent: 'space-between',
							display: 'flex',
							flexDirection: 'column',
							height: '100%',
							padding: '20px 0px',
						}}
					>
						<div
							style={{
								width: 'fit-content',
								height: 'fit-content',
								fontSize: 80,
								textAlign: 'center',
								padding: '0px 10px',
							}}
						>
							... Mais les autres ne sont pas en reste non plus ! Voici le
							podium des 5 plus actifs
						</div>
						<BarChartGraph
							nbOfCountPerParticipants={nbOfCountPerParticipants}
							width={1200}
							height={500}
						/>
					</Animated>
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
