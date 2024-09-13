import React from 'react';
import './DiffViewer.css'; // Import your CSS for styling

const DiffViewer = ({ files }) => {
    return (
        <div className="diff-viewer">
            {files.map((file, index) => (
                <div key={index} className="file-diff">
                    <h3 className="file-name">{file.filename}</h3>
                    <pre className="patch">
                        {file.patch && file.patch.split('\n').map((line, i) => (
                            <DiffLine key={i} line={line} />
                        ))}
                    </pre>
                </div>
            ))}
        </div>
    );
};

const DiffLine = ({ line }) => {
    // Determine the type of line based on the first character
    if (line.startsWith('+')) {
        return <div className="diff-line added">{line}</div>;
    } else if (line.startsWith('-')) {
        return <div className="diff-line removed">{line}</div>;
    } else {
        return <div className="diff-line">{line}</div>;
    }
};

export default DiffViewer;
