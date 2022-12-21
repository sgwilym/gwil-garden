import { Doc, isErr } from "earthstar";
import { ES_AUTHOR_ADDRESS } from "../constants";
import { getGardenReplica } from "./storage.server";

export type LobbyPost = {
  content: string;
  timestamp: number;
  published: Date;
};

export function sortByPublished(docA: Doc, docB: Doc) {
  const aTimestamp = getLobbyDocPublishedTimestamp(docA);
  const bTimestamp = getLobbyDocPublishedTimestamp(docB);

  return aTimestamp > bTimestamp ? -1 : 1;
}

const pathTimestampRegex = /(\d*)(?:\.txt)/;

export function getLobbyDocPublishedTimestamp(doc: Doc): number {
  const result = pathTimestampRegex.exec(doc.path);

  if (result === null) {
    return 0;
  }

  return parseInt(result[0]);
}

function lobbyPostFromDoc(doc: Doc): LobbyPost {
  const timestamp = getLobbyDocPublishedTimestamp(doc);

  return {
    content: doc.content,
    timestamp,
    published: new Date(timestamp),
  };
}

export async function getLobbyPosts(): Promise<LobbyPost[]> {
  const replica = getGardenReplica();

  if (!replica) {
    return [];
  }

  const posts = await replica?.queryDocs({
    filter: {
      pathStartsWith: `/lobby/~${ES_AUTHOR_ADDRESS}/`,
      pathEndsWith: ".txt",
      contentLengthGt: 0,
    },
  });

  return posts.map(lobbyPostFromDoc).sort((aPost, bPost) =>
    aPost.published < bPost.published ? 1 : -1
  );
}

/*
export function getStarredLobbyPosts(): LobbyPost[] {
  const storage = getGardenReplica();

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
*/

export async function getLobbyPost(
  timestamp: number,
): Promise<LobbyPost | undefined> {
  const replica = getGardenReplica();

  if (!replica) {
    return undefined;
  }

  // Use documents so that we can use pathStarts/Endswith
  // So that we can also get any ephemeral documents
  // If there are somehow two (unlikely)
  // Just use the first one
  const [post] = await replica?.queryDocs({
    filter: {
      pathStartsWith: `/lobby/~${ES_AUTHOR_ADDRESS}/`,
      pathEndsWith: `${timestamp}.txt`,
      contentLengthGt: 0,
    },
  });

  return post ? lobbyPostFromDoc(post) : undefined;
}
