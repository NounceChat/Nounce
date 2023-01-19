import { FunctionComponent } from 'react';

interface BoxProps { }
 
const Box: FunctionComponent<BoxProps> = () => {

    return (
      <mesh rotation={[90, 0, 20]}>
        <boxGeometry attach="geometry" args={[3, 3, 3]} />
        <meshNormalMaterial attach="material" />
      </mesh>
    );
}
 
export default Box;