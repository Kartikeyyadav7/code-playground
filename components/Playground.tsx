import Split from "react-split";

const Playground = () => {
    return (
        <>
            <Split className="flex" style={{ height: `100vh` }}>
                <div className="bg-gray-200">Files</div>
                <Split direction="vertical" style={{ height: `100vh` }}>
                    <div className="bg-gray-500">Editor</div>
                    <div className="bg-gray-600">Terminal</div>
                </Split>
                <div className="bg-gray-700">Iframe</div>
            </Split>
        </>
    );
};

export default Playground;
