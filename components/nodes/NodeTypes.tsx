import { useMemo } from "react";
import TextNode from "./TextNode";
import UploadImageNode from "./UploadImageNode";
import UploadVideoNode from "./UploadVideoNode";
import LLMNode from "./LLMNode";
import CropImageNode from "./CropImageNode";
import ExtractFrameNode from "./ExtractFrameNode";

const nodeTypesMap = {
  text: TextNode,
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  llm: LLMNode,
  cropImage: CropImageNode,
  extractFrame: ExtractFrameNode,
};

export const nodeTypes = nodeTypesMap;