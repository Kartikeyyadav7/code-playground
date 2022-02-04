import Editor from "@monaco-editor/react";
import { XTerm } from "xterm-for-react";
import { useRef, useEffect, useState } from "react";
import Split from "react-split";

const Playground = () => {
	const [fileNames, setFileNames] = useState([]);
	const [pathName, setPathName] = useState("");
	const [lang, setLang] = useState("");
	const [value, setValue] = useState("");

	const xtermRef = useRef<XTerm>(null);
	const terminalRef = useRef<WebSocket>();
	const fileSysRef = useRef<WebSocket>();
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	useEffect(() => {
		console.log("Hello");

		terminalRef.current = new WebSocket("ws://localhost:8080/terminal");

		terminalRef.current.onopen = () => {
			console.log("terminal started");
		};

		terminalRef.current.onmessage = (event) => {
			console.log("got the msg from terminal");
			xtermRef.current?.terminal.write(event.data);
		};

		const terminalRefCurrent = terminalRef.current;

		return () => {
			terminalRefCurrent.close();
		};
	}, []);

	useEffect(() => {
		fileSysRef.current = new WebSocket("ws://localhost:8080/fileSys");

		fileSysRef.current.onopen = () => {
			console.log("Opened");
			fileSysRef.current?.send(
				JSON.stringify({
					type: "get-all-files",
				})
			);
		};
		fileSysRef.current.onmessage = (event) => {
			const parsedData = JSON.parse(event.data.toString());
			console.log("recieved msg", parsedData);
			if (parsedData.type === "update-all-files") {
				setFileNames(parsedData.contents);
				console.log(parsedData.contents);
			}
		};

		const fileSysRefCurrent = fileSysRef.current;

		return () => {
			fileSysRefCurrent.close();
		};
	}, []);

	console.log(fileNames);

	function handleEditorChange(value: string | undefined) {
		console.log("here is the current model value:", value);
		console.log("language", pathName);
		fileSysRef.current?.send(
			JSON.stringify({
				type: "update-file",
				content: {
					fileName: pathName,
					fileContent: value,
				},
			})
		);
		if (iframeRef.current) {
			iframeRef.current.src = "http://localhost:1338";
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

	type fileNamesProp = {
		fileName: string;
		content: string;
	};

	return (
		<div>
			<Split
				sizes={[25, 25, 25, 25]}
				style={{ height: `100vh`, display: "flex" }}
			>
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
				{/* <Split direction="horizontal" sizes={[50, 50]}> */}
				<Editor
					theme="vs-dark"
					path={pathName}
					defaultLanguage={lang}
					defaultValue={value}
					onChange={handleEditorChange}
				/>
				{/* </Split> */}
				<iframe
					ref={iframeRef}
					title="Code"
					onLoad={() => console.log("loaded")}
					src="http://localhost:1338"
					onError={() => console.log("error")}
				/>
				<XTerm ref={xtermRef} />
			</Split>
		</div>
	);
};

export default Playground;
