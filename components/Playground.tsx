import Split from "react-split";
import Editor from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
// import { XTerm } from "xterm-for-react";

const Playground = () => {
    // const XTerm = dynamic(() => import("xterm-for-react/dist/src/XTerm"), {
    //     ssr: false,
    // });
    const Xterm = dynamic(() => import("./Xterm"), {
        ssr: false,
    });

    const [fileNames, setFileNames] = useState([]);
    const [pathName, setPathName] = useState("");
    const [lang, setLang] = useState("");
    const [value, setValue] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xtermRef = useRef<any>(null);

    const fileSysWebSocket = new WebSocket("ws://localhost:8080/fileSys");

    const webSocketFileSysConnection = () => {
        if (fileSysWebSocket) {
            fileSysWebSocket.onopen = () => {
                fileSysWebSocket.send(JSON.stringify({ type: "get-all-files" }));
            };

            fileSysWebSocket.onmessage = function (event) {
                const json = JSON.parse(event.data);
                try {
                    if (json.type == "update-all-files") {
                        setFileNames(json.contents);
                    }
                } catch (err) {
                    console.log(err);
                }
            };
        }
    };

    const terminalWebSocket = new WebSocket("ws://localhost:8080/terminal");

    const webSocketTerminalConnection = () => {
        if (terminalWebSocket) {
            terminalWebSocket.onopen = () => {
                console.log("connection to terminal opened");
            };

            terminalWebSocket.onmessage = (event) => {
                console.log("message received in terminal");
                console.log("Now I am getting data from pty", event.data);
                // When there is data from PTY on server, print that on Terminal.
                xtermRef.current?.terminal.write(event.data);
            };

            xtermRef.current?.terminal.onData((data: string) => {
                console.log("Now data is being emitted", data);
                terminalWebSocket.send(data);
            });
        }
    };

    // const start = (serverAddress: string) => {
    //   connectToSocket(serverAddress)
    //     .then((socket) => {
    //       console.log('The socket is getting first');
    //       socket.on('connect', () => {
    //         console.log('Id', socket.id);
    //         console.log('Now the terminal is instantiated');

    //         console.log('Creating a new terminal now');

    //         socket.on('output', (data: any) => {
    //           console.log('Now I am getting data from pty', data);
    //           // When there is data from PTY on server, print that on Terminal.
    //           xtermRef.current?.terminal.write(data);
    //         });

    //         socket.emit('message', `lite-server\r`);

    //         xtermRef.current?.terminal.onData((data: any) => {
    //           console.log('Now data is being emitted', data);
    //           socket.emit('input', data);
    //         });
    //       });
    //     })
    //     .catch((err) => console.log('Error occured while connecting to socket'));
    // };

    useEffect(() => {
        webSocketFileSysConnection();
        webSocketTerminalConnection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileNames]);

    function handleEditorChange(value: string | undefined) {
        console.log("here is the current model value:", value);
        console.log("language", pathName);
        fileSysWebSocket.send(
            JSON.stringify({
                type: "update-file",
                content: {
                    fileName: pathName,
                    fileContent: value,
                },
            })
        );
    }

    const onBtnClick = (name: fileNameProp) => {
        setPathName(name.fileName);
        setLang(name.fileName.split(".")[1] === "js" ? "javascript" : name.fileName.split(".")[1]);

        setValue(name.content);
    };

    type fileNameProp = {
        fileName: string;
        content: string;
    };

    return (
        <>
            <Split sizes={[20, 40, 40]} className="flex" style={{ height: `100vh` }}>
                <div className="bg-black flex flex-col">
                    {fileNames.map((name: fileNameProp) => (
                        <button
                            key={name.fileName}
                            disabled={pathName === name.fileName}
                            onClick={() => onBtnClick(name)}
                        >
                            {name.fileName}
                        </button>
                    ))}
                </div>
                <Editor
                    theme="vs-dark"
                    path={pathName}
                    defaultLanguage={lang}
                    defaultValue={value}
                    onChange={handleEditorChange}
                />

                <iframe
                    src="http://localhost:8080"
                    onLoad={() => console.log("loaded")}
                    onError={() => console.log("error")}
                ></iframe>
            </Split>
            <Xterm
                ref={xtermRef}
                options={{
                    rows: 10,
                    cols: 170,
                }}
            />
        </>
    );
};

export default Playground;
