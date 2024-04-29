// TODO: Consider moving to the database
// TODO: Create more specific queries for each need
const QUERIES = new Map<
    string,
    {
        pageSize?: number;
        select?: any;
        include?: any;
        where?: any;
        orderBy?: any;
    }
>();

QUERIES.set('Concept', {
    include: {
        parent: true,
        references: true,
        translations: {
            include: {
                language: true
            }
        },
        variations: true,
        concepts: {
            include: {
                media: {
                    orderBy: ['position']
                }
            }
        },
        relatedConcepts: {
            include: {
                media: {
                    orderBy: ['position']
                }
            }
        },
        media: {
            orderBy: ['position']
        },
        children: true
    }
});

QUERIES.set('TrackChanges', {
    include: {
        parent: true,
        references: true,
        translations: true,
        variations: true,
        concepts: true,
        relatedConcepts: true
    }
});

QUERIES.set('network', {
    pageSize: -1,
    select: JSON.stringify(['id', 'name', 'nameSlug', 'parentId']),
    include: JSON.stringify(['relatedConcepts', 'concepts'])
});

export default QUERIES;
