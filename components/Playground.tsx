// import { useRef } from "react";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import dynamic from "next/dynamic";

const Playground = () => {
    const Xterm = dynamic(() => import("./Xterm"), {
        ssr: false,
    });
    return (
        <>
            <Split className="flex" style={{ height: `100vh` }}>
                <div className="bg-black flex flex-col">
                    <button className="bg-white">index.html</button>
                    <button className="bg-white">style.css</button>
                    <button className="bg-white">script.js</button>
                </div>
                <Split direction="vertical" style={{ height: `100vh` }}>
                    <Editor
                        // height="80vh"
                        theme="vs-dark"
                        // path={pathName}
                        // defaultLanguage={langName}
                        // defaultValue={valueName}
                        // onChange={handleEditorChange}
                        defaultLanguage="javascript"
                        defaultValue="// ok lets start"
                    />
                    <Xterm />
                </Split>
                <iframe
                    src="http://localhost:8080"
                    onLoad={() => console.log("loaded")}
                    onError={() => console.log("error")}
                ></iframe>
            </Split>
        </>
    );
};

export default Playground;
