// TODO: Consider moving to the database
const QUERIES = new Map<string, { include?: any, where?: any, orderBy?: any }>();

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
        entries: true,
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

QUERIES.set('Category', {
    include: {
        parent: true
    },
    where: {
        isCategory: true
    }
});


export default QUERIES;


