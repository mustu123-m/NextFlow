import TextNode from "./TextNode";
import UploadImageNode from "./UploadImageNode";
import UploadVideoNode from "./UploadVideoNode";
import LLMNode from "./LLMNode";
import CropImageNode from "./CropImageNode";
import ExtractFrameNode from "./ExtractFrameNode";

export const nodeTypes = {
  text: TextNode,
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  llm: LLMNode,
  cropImage: CropImageNode,
  extractFrame: ExtractFrameNode,
};