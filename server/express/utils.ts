function prepareRequestBodyForPrisma(data: any, create: boolean = false) {
    
    let transformedData = {...data};
    
    Object.keys(transformedData).forEach(key => {
        
        if (key.endsWith('Id')) {

            transformedData[key] = parseInt(transformedData[key]);

        } else if (Array.isArray(transformedData[key])) {

            transformedData[key] = create ? {
                connect: mapIds(transformedData[key])
            } : {
                set: mapIds(transformedData[key])
            };

        } else if (typeof transformedData[key] === 'object' && transformedData[key] !== null) {

            transformedData[key] = create ? {
                connect: {
                    id: parseInt(transformedData[key].id)
                }
            } : {
                set: {
                    id: parseInt(transformedData[key].id)
                }
            };
        }

    });

    return replaceEmptyWithNull(transformedData);
}

function mapIds(values: any[]) {
    return values.map((value) => { return { id: parseInt(value.id) } });
}

function replaceEmptyWithNull(obj: any) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
        newObj[key] = value === "" ? null : value;
        newObj[key] = value === 0 ? null : value;
        if (key === 'id') {
            newObj[key] = value === 0 ? undefined : value;
        }
    }
    return newObj;
}

export { prepareRequestBodyForPrisma, replaceEmptyWithNull };