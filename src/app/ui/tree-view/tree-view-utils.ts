export const getDragImageClass = (entry: {type: string, isDir?: boolean}): string => {
    if (entry.type === "Workflow") {
        return "icon-workflow";
    } else if (entry.type === "CommandLineTool" || entry.type === "ExpressionTool") {
        return "icon-command-line-tool";
    } else if (entry.isDir) {
        return "icon-directory";
    }

    return "icon-file";
};

export const getDragTransferDataType = (entry: {type: string, isDir?: boolean}): string => {
    if (entry.type === "Workflow" || entry.type === "CommandLineTool" || entry.type === "ExpressionTool") {
        return "cwl";
    } else if (entry.isDir) {
        return "directory";
    }

    return "file";
};