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
                    include: {
                        media: true
                    },
                    orderBy: ['position']
                },
            }
        },
        changes: {
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: ['name']
                }
            }
        },
        relatedEntries: {
            include: {
                media: {
                    include: {
                        media: true
                    },
                    orderBy: ['position']
                },
            }
        },
        media: {
            include: {
                media: true
            },
            orderBy: ['position']
        },
        children: true
    },
    where: {
        isCategory: false
    }
});


QUERIES.set('network', {
    pageSize: -1,
    select: JSON.stringify(['id', 'name', 'nameSlug', 'parentId']),
    include: JSON.stringify(['relatedEntries', 'entries']),
    where: {
        isCategory: false
    }
});



QUERIES.set('Category', {
    include: {
        parent: true
    },
    where: {
        isCategory: true
    }
});


export default QUERIES;


