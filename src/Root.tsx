import {Composition} from 'remotion';
import {MyComposition} from './Composition';
import {MyComposition2} from './Composition2';
import {MyComposition3} from './Composition3';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MyComp"
				component={MyComposition}
				durationInFrames={60}
				fps={30}
				width={1280}
				height={720}
			/>
			<Composition
				id="MyComp2"
				component={MyComposition2}
				durationInFrames={45 * 30}
				fps={30}
				width={1280}
				height={720}
			/>
			<Composition
				id="MyComp3"
				component={MyComposition3}
				durationInFrames={1350}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};
