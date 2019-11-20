"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function createTag({ tagName, tagMsg = '' }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.GITHUB_WORKSPACE ||
            !process.env.GITHUB_TOKEN ||
            !process.env.GITHUB_REPOSITORY) {
            core.setFailed('missing required env vars');
            return;
        }
        // Check for existing tag
        const git = new github.GitHub(process.env.GITHUB_TOKEN);
        const owner = process.env.GITHUB_ACTOR;
        const repo = process.env.GITHUB_REPOSITORY.split('/').pop();
        const tags = yield git.repos.listTags({
            owner,
            repo,
            per_page: 100
        });
        for (let tag of tags.data) {
            if (tag.name.trim().toLowerCase() === tagName.trim().toLowerCase()) {
                core.warning(`"${tag.name.trim()}" tag already exists.`);
                return;
            }
        }
        const newTag = yield git.git.createTag({
            owner,
            repo,
            tag: tagName,
            message: tagMsg,
            object: process.env.GITHUB_SHA,
            type: 'commit'
        });
        const newReference = yield git.git.createRef({
            owner,
            repo,
            ref: `refs/tags/${newTag.data.tag}`,
            sha: newTag.data.sha
        });
        core.warning(`Reference ${newReference.data.ref} available at ${newReference.data.url}`);
        return { url: newReference.data.url };
    });
}
exports.createTag = createTag;