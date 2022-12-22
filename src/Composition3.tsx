import messagesRepairedJSON from '../input/messages_combined@1.json';
import {BarChartGraph} from './Composition2/BarChartGraph';

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

export const MyComposition3 = () => {
	return <BarChartGraph nbOfCountPerParticipants={nbOfCountPerParticipants} />;
};
