import { FunctionComponent } from 'react';

interface BoxProps { }
 
const Box: FunctionComponent<BoxProps> = () => {

    return (
      <mesh rotation={[90, 0, 20]}>
        <boxGeometry attach="geometry" args={[2, 2, 2]} />
        <meshNormalMaterial attach="material" />
      </mesh>
    );
}
 
export default Box;