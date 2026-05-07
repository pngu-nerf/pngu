import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'pngu-nerf',
      name: 'pngu'
    }
  },
  collections: {
    blasters: collection({
      label: 'Blaster Data',
      slugField: 'title',
      path: 'src/content/blasters/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Blaster Name' } }),
        description: fields.text({ label: 'Short Description' }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/blasters',
          publicPath: '/images/blasters/'
        }),
        attachedFiles: fields.array(
          fields.object({
            fileName: fields.text({ label: 'File Name' }),
            fileUrl: fields.url({ label: 'Download URL (R2 link)' })
          }),
          { label: 'Attached Files', itemLabel: props => props.fields.fileName.value }
        ),
        content: fields.markdoc({ label: 'Documentation Content' }),
      },
    }),
  },
});
