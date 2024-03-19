// TODO: Consider moving to the database
// TODO: Create more specific queries for each need
const QUERIES = new Map<string, { pageSize?: number, select?: any, include?: any, where?: any, orderBy?: any }>();

QUERIES.set('Entry', {
    include: {
        parent: true,
        references: true,
        translations: {
            include: {
                language: true
            },
        },
        variations: true,
        entries: {
            include: {
                media: {
                    orderBy: ['position']
                },
            }
        },
        changes: {
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: ['name']
                }
            }
        },
        relatedEntries: {
            include: {
                media: {
                    orderBy: ['position']
                },
            }
        },
        media: {
            orderBy: ['position']
        },
        children: true
    },
});


QUERIES.set('network', {
    pageSize: -1,
    select: JSON.stringify(['id', 'name', 'nameSlug', 'parentId']),
    include: JSON.stringify(['relatedEntries', 'entries']),
});

export default QUERIES;


