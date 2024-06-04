<template>
    <div class="flex flex-col mb-4" v-if="!isEmpty">
        
        <UITitle>{{ title }}</UITitle>
        
        <div class="flex flex-col">

            <p>
                <span v-if="Array.isArray(content)">
                    <span v-for="item in content" :key="item.name">
                        <UILink v-if="hasLink && !isOneLine" :href="item.link">
                            {{ item.name }}
                        </UILink>
                        <span v-else-if="!isOneLine">{{ item.name }}</span>
                        <span v-if="!isOneLine && content.indexOf(item) !== content.length - 1"> | </span>

                        <p v-if="isOneLine">
                            <div v-if="isHtml" v-html="item.nameRich" class="mb-2"></div>
                        </p>
                    </span>
                </span>

                <div v-else-if="isHtml" v-html="parsedContent"></div>

                <span v-else>{{ content }}</span>
            </p>
        </div>
    </div>
</template>
  
<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    content: {
        type: [String, Array, Object],
    },
    isHtml: {
        type: Boolean,
        default: false
    },
    hasLink: {
        type: Boolean,
        default: false
    },
    isOneLine: {
        type: Boolean,
        default: false
    }
})
// TODO: Maybe implement a URL detector manually? Navite JS API can't validate google.com.br as an example 

const buildHyperlink = (term?: string, slug?: string, priorityName?: string, url?: string) => {
    const hyperlinkProperties: {
        displayText: string,
        hrefUrl: string,
        styles: string
    } = {
        displayText: '',
        hrefUrl: '',
        styles: ["underline", "text-blue-600", "hover:text-blue-800", "visited:text-purple-600"].join(" ")   
    };

    if (term) {

        if (!slug && !priorityName && !url) return term;

        if (slug) {
            hyperlinkProperties.displayText = term;
            hyperlinkProperties.hrefUrl = slug;

        };

        if (priorityName) {
            if (!slug) {
                return priorityName;
            }

            hyperlinkProperties.displayText = priorityName;
            hyperlinkProperties.hrefUrl = slug;
            
        }

        if (term && !slug && !priorityName && url) {
            hyperlinkProperties.displayText = term;
            hyperlinkProperties.hrefUrl = url;

        }

    return `<span class="${hyperlinkProperties.styles}"><a href="${hyperlinkProperties.hrefUrl}">${hyperlinkProperties.displayText}</a></span>` 
}
}

const provideHyperlinkFromTerm = async (term: string, priorityName?: string) => {
    try {
        const response = await useFetchWithBaseUrl(`/api/public/concept`, {
                method: "GET",
                params: {
                    "where": {
                        "name": {
                        "like": term
                        }
                    },
                    "pageSize": 1
                }
                
            }).then((data) => {
                return data;
            });
            
            if (response.data.value.total == 0) { 
                if (term) {
                    if (priorityName) {
                        if (await isParenthesesContentAUrl(priorityName)) {
                            return buildHyperlink(term, undefined, priorityName)

                        }
                        return priorityName

                    }
                    return term;
                }

            }

            const slug = response.data.value.items[0].nameSlug;
            if (priorityName) {
                return buildHyperlink(term, slug, priorityName);
                
            }
            return buildHyperlink(term, slug)

    } catch (err) {
        console.error(err)

    }

}

const replaceAsync = async (content: string, pattern: RegExp, replacer: (match: RegExpExecArray) => Promise<string | undefined>) => {
    const replacements = await Promise.all(
        Array.from(content.matchAll(pattern))
            .map(match => replacer(match)) 
    );

    let i = 0;
    return content.replace(pattern, () => replacements[i++] || '');

}
const provideHyperLinkFromMatch = async (match: RegExpExecArray): Promise<string | undefined> => {

    const term = match[1]
    if (match.length === 2) {
        return await provideHyperlinkFromTerm(term);
    }
    const parenthesesContent = match[2];
    if (await isParenthesesContentAUrl(parenthesesContent)) {
        const url = parenthesesContent;
        return buildHyperlink(term, undefined, undefined, url)

    }

    const priorityName = match[2]
    return provideHyperlinkFromTerm(term, priorityName); 

} 

const isParenthesesContentAUrl = async (content: string): Promise<Boolean | undefined> => {
        try {
            return Boolean(new URL(content))
        } catch (e) {

            return false
        }
    
}

const matchDoubleBracketPatternAndReplace =  async (content: string) => {
    const pattern = new RegExp("\\[\\[(.*?)\\]\\]", "g");
    return await replaceAsync(content, pattern, provideHyperLinkFromMatch);

}

const matchDoubleBracketsWithParenthesisAndReplace = async (content: string) => {
    const pattern = new RegExp("\\[\\[([^\\]]+?)\\]\\]\\(([^\\)]+)\\)", "g");
    return await replaceAsync(content, pattern, provideHyperLinkFromMatch)

};

const parseHyperlinkContent = async (content: string) => {
    return await matchDoubleBracketPatternAndReplace(await matchDoubleBracketsWithParenthesisAndReplace(content));
}

const parsedContent= ref('');

const onBeforeMount = (async () => {
    if (typeof(props.content) != "string") {
        parsedContent.value = String(props.content);
        
    }   

    parsedContent.value = await parseHyperlinkContent(String(props.content));
    
})

onBeforeMount();
const isEmpty = computed(() => {
    if (!props.content) {
        return true
    }

    if (Array.isArray(props.content) && props.content.length === 0) {
        return true
    }
});

</script>