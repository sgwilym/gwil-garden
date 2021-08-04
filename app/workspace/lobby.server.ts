import { Document, isErr } from "earthstar";
import { findEdgesSync, GraphEdgeContent } from "earthstar-graph-db";
import { ES_AUTHOR_ADDRESS } from "../constants";
import { getGardenStorage } from "./storage.server";

export type LobbyPost = {
  content: string;
  timestamp: number;
  published: Date;
};

export function sortByPublished(docA: Document, docB: Document) {
  const aTimestamp = getLobbyDocPublishedTimestamp(docA);
  const bTimestamp = getLobbyDocPublishedTimestamp(docB);

  return aTimestamp > bTimestamp ? -1 : 1;
}

const pathTimestampRegex = /(\d*)(?:\.txt)/;

export function getLobbyDocPublishedTimestamp(doc: Document): number {
  const result = pathTimestampRegex.exec(doc.path);

  if (result === null) {
    return 0;
  }

  return parseInt(result[0]);
}

function lobbyPostFromDoc(doc: Document): LobbyPost {
  const timestamp = getLobbyDocPublishedTimestamp(doc);

  return {
    content: doc.content,
    timestamp,
    published: new Date(timestamp),
  };
}

export function getLobbyPosts(): LobbyPost[] {
  const storage = getGardenStorage();

  if (!storage) {
    return [];
  }

  const posts = storage?.documents({
    pathStartsWith: `/lobby/~${ES_AUTHOR_ADDRESS}/`,
    pathEndsWith: ".txt",
    contentLengthGt: 0,
  });

  return posts.map(lobbyPostFromDoc).sort((aPost, bPost) =>
    aPost.published < bPost.published ? 1 : -1
  );
}

export function getStarredLobbyPosts(): LobbyPost[] {
  const storage = getGardenStorage();

  if (!storage) {
    return [];
  }

  const edges = findEdgesSync(storage, {
    appName: "LOBBY",
    kind: "STARRED_BY",
    owner: ES_AUTHOR_ADDRESS,
  });

  if (isErr(edges)) {
    return [];
  }

  const posts = edges.map((edge) => {
    const edgeContent: GraphEdgeContent = JSON.parse(edge.content);

    return edgeContent.source;
  }).map((source) => storage.getDocument(source)).filter((
    maybeDoc,
  ): maybeDoc is Document =>
    maybeDoc !== undefined && maybeDoc.content.length > 0
  ).map(lobbyPostFromDoc).sort((aPost, bPost) =>
    aPost.published < bPost.published ? 1 : -1
  );

  return posts;
}

export function getLobbyPost(timestamp: number): LobbyPost | undefined {
  const storage = getGardenStorage();

  if (!storage) {
    return undefined;
  }

  // Use documents so that we can use pathStarts/Endswith
  // So that we can also get any ephemeral documents
  // If there are somehow two (unlikely)
  // Just use the first one
  const [post] = storage?.documents({
    pathStartsWith: `/lobby/~${ES_AUTHOR_ADDRESS}/`,
    pathEndsWith: `${timestamp}.txt`,
    contentLengthGt: 0,
  });

  return post ? lobbyPostFromDoc(post) : undefined;
}
