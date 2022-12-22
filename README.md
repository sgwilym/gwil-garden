# Gwil's Garden

An [Earthstar](https://earthstar-project.org) server which I've extended so that
it can serve a blog posts with HTML, and syndication with RSS.

I write blog posts on my filesystem on my computer. I wrote a script which
writes them to a local Earthstar replica and then syncs with this server. The
server then uses this synced data when requests come through for posts, RSS,
etc.

The server itself is defined in `src/server.ts`. You can see the extensions it
uses there.

Functionality is implemented as different Earthstar server extensions, found in
`src/garden_extensions`.

HTML is generated with React and `renderToStaticMarkup`, and these templates can
be found in `src/components`

Some shared functionality (e.g. getting blog posts from the Earthstar replica)
exist in `src/helpers`.

Styling is done with a CLI installation of Tailwind.

If you'd like to run this yourself, run `deno task server`. You'll need Deno
installed.
