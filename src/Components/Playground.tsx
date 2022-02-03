import Editor from "@monaco-editor/react";
import { useEffect, useState, useRef } from "react";
import Split from "react-split";
import { XTerm } from "xterm-for-react";

const Playground = () => {
	const [fileNames, setFileNames] = useState([]);
	const [pathName, setPathName] = useState("");
	const [lang, setLang] = useState("");
	const [value, setValue] = useState("");

	const fileSysWebSocket = useRef<WebSocket>();
	const terminalWebSocket = useRef<WebSocket>();
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const xtermRef = useRef<XTerm>(null);

	useEffect(() => {
		fileSysWebSocket.current = new WebSocket("ws://localhost:8081/fileSys");
		fileSysWebSocket.current.onopen = () => {
			console.log("Opened");
			fileSysWebSocket.current?.send(
				JSON.stringify({
					type: "get-all-files",
				})
			);
		};
		fileSysWebSocket.current.onmessage = (event) => {
			const parsedData = JSON.parse(event.data.toString());
			console.log("recieved msg", parsedData);
			if (parsedData.type === "update-all-files") {
				setFileNames(parsedData.contents);
			}
		};

		const fileSysWebSocketCurrent = fileSysWebSocket.current;

		return () => {
			fileSysWebSocketCurrent.close();
		};
	}, []);

	useEffect(() => {
		terminalWebSocket.current = new WebSocket("ws://localhost:8081/terminal");
		terminalWebSocket.current.onopen = () => {
			console.log("Opened terminal connection");
		};

		terminalWebSocket.current.onmessage = (event) => {
			console.log("message received in terminal");
			console.log("Now I am getting data from pty", event.data);
			// When there is data from PTY on server, print that on Terminal.
			xtermRef.current?.terminal.write(event.data);
		};

		xtermRef.current?.terminal.onData((data: string) => {
			console.log("Now data is being emitted", data);
			terminalWebSocket.current?.send(data);
		});

		const terminalWebSocketCurrent = terminalWebSocket.current;
		return () => {
			terminalWebSocketCurrent.close();
		};
	}, []);

	type fileNamesProp = {
		fileName: string;
		content: string;
	};

	console.log("fileNames", fileNames);

	function handleEditorChange(value: string | undefined) {
		console.log("here is the current model value:", value);
		console.log("language", pathName);
		fileSysWebSocket.current?.send(
			JSON.stringify({
				type: "update-file",
				content: {
					fileName: pathName,
					fileContent: value,
				},
			})
		);
		if (iframeRef.current) {
			iframeRef.current.src = "http://localhost:1337";
		}
	}

	const onFileSelect = (name: fileNamesProp) => {
		setPathName(name.fileName);
		setLang(
			name.fileName.split(".")[1] === "js"
				? "javascript"
				: name.fileName.split(".")[1]
		);

		setValue(name.content);
	};

	return (
		<>
			<Split sizes={[20, 40, 40]} style={{ height: `100vh`, display: "flex" }}>
				<div style={{ display: "flex", flexDirection: "column" }}>
					{fileNames !== [] ? (
						<div style={{ display: "flex", flexDirection: "column" }}>
							{fileNames.map((name: fileNamesProp) => (
								<button
									key={name.fileName}
									disabled={pathName === name.fileName}
									onClick={() => onFileSelect(name)}
								>
									{name.fileName}
								</button>
							))}
						</div>
					) : (
						<div>Loading...</div>
					)}
				</div>
				<Editor
					theme="vs-dark"
					path={pathName}
					defaultLanguage={lang}
					defaultValue={value}
					onChange={handleEditorChange}
				/>

				<iframe
					ref={iframeRef}
					title="Code"
					onLoad={() => console.log("loaded")}
					src="http://localhost:1337"
					onError={() => console.log("error")}
				/>
			</Split>
			<XTerm
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
