<template>
    <div
        class="mt-5 md:mx-auto min-h-[60vh] w-full rounded-tl overflow-hidden bg-gray-100"
        v-if="concepts.length != 0"
    >
        <h1 class="text-xl pb-8 md:text-3xl text-center font-bold mt-5">
            <UITooltip :help="help" placement="top">
                Mapa de relacionamentos
            </UITooltip>
        </h1>
        <div id="network" class="w-full h-full">
            <svg
                :viewBox="viewBox.join(' ')"
                :width="width"
                :height="height"
                style="max-width: 100%; height: auto"
                id="network-svg"
            ></svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3';

const help = `
O mapa de relacionamentos mostra como os termos estão conectados entre si, a partir do campo Ver também.
Cada nó representa um termo e cada linha representa uma conexão. Clique em um nó para ver mais informações sobre o termo.
Somente os 100 termos mais conectados são exibidos.
`;

const config = useRuntimeConfig().public;
const secondaryColor = config.secondaryColor;
const themeColor = config.themeColor;
const primaryColor = config.primaryColor;

const conceptStore = useConceptStore();
const { conceptsNetwork: concepts } = storeToRefs(conceptStore);

if (!concepts.value || concepts.value.length === 0) {
    await conceptStore.fetchNetwork();
}

const nodeMapSize = new Map();
const addedNodes = new Set();
const tempNodes = [] as {
    id: number;
    label: string;
    slug: string;
    value: number;
}[];
const links = [] as {
    source: number;
    target: number;
    value: number;
    distance: number;
}[];

const nodeSize = 8;
const nodeGap = 2;

concepts.value.forEach((concept) => {
    tempNodes.push({
        id: concept.id,
        label: concept.name,
        slug: concept.nameSlug,
        value: nodeSize
    });

    addedNodes.add(concept.id);

    concept.concepts?.forEach((child) => {
        if (!addedNodes.has(child.id)) {
            addedNodes.add(child.id);
            tempNodes.push({
                id: child.id,
                label: child.name,
                slug: child.nameSlug,
                value: nodeSize
            });
        }

        nodeMapSize.set(
            concept.id,
            (nodeMapSize.get(concept.id) || nodeSize) + nodeGap
        );

        nodeMapSize.set(
            child.id,
            (nodeMapSize.get(child.id) || nodeSize) + nodeGap
        );

        links.push({
            source: concept.id,
            target: child.id,
            value: 1,
            distance: 300 + Math.random() * 50
        });

    });

    concept.relatedConcepts?.forEach((related) => {
        if (!addedNodes.has(related.id)) {
            addedNodes.add(related.id);
            tempNodes.push({
                id: related.id,
                label: related.name,
                slug: related.nameSlug,
                value: nodeSize
            });
        }

        nodeMapSize.set(
            concept.id,
            (nodeMapSize.get(concept.id) || nodeSize) + nodeGap
        );

        nodeMapSize.set(
            related.id,
            (nodeMapSize.get(related.id) || nodeSize) + nodeGap
        );

        links.push({
            source: concept.id,
            target: related.id,
            value: 1,
            distance: 75 + Math.random() * 50
        });
    });
});

const repeatedNodes = new Set();
const nodes = [] as {
    id: number;
    label: string;
    slug: string;
    value: number;
}[];

tempNodes.forEach((node) => {
    if (!repeatedNodes.has(node.id)) {
        repeatedNodes.add(node.id);
        node.value = nodeMapSize.get(node.id) || nodeSize;
        nodes.push(node);
    }
});

// remove all from tempNodes
tempNodes.splice(0, tempNodes.length);

const data = {
    nodes,
    links
};

const width = ref(0);
const height = ref(0);
const viewBox = ref([0, 0, 0, 0]) as Ref<number[]>;

onMounted(() => {
    const updateDimensions = () => {
        const networkDiv = document.getElementById('network');

        if (!networkDiv) {
            return;
        }

        width.value = networkDiv.offsetWidth;
        height.value = networkDiv.offsetHeight;
        viewBox.value = [
            -width.value / 2,
            -height.value / 2,
            width.value,
            height.value
        ];
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    const links = data.links.map((d) => ({ ...d }));
    const nodes = data.nodes.map((d) => ({ ...d }));

    const simulation = d3
        // @ts-ignore
        .forceSimulation(nodes)
        .force(
            'link',
            d3
                .forceLink(links)
                // @ts-ignore
                .id((d) => d.id)
                .distance((d) => d.distance * 1.2)
        )
        .force('charge', d3.forceManyBody().strength(-90))
        .force('center', d3.forceCenter(0, 0))
        .force('y', d3.forceY().strength(0.03))
        .force(
            'collide',
            d3.forceCollide().radius((d) => Math.sqrt(d.value) * 3 + 1)
        );

    const svg = d3.select('#network-svg');

    const link = svg
        .append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.2)
        .selectAll()
        .data(links)
        .join('line')
        .attr('stroke-width', 1.5)
        .attr('id', (d) => 'link-' + d.id);

    d3.line().curve(d3.curveBasis);

    const node = svg
        .append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .selectAll()
        .data(nodes)
        .join('circle')
        .attr('r', (d) => Math.sqrt(d.value) * 3)
        .attr('fill', secondaryColor)
        .attr('cursor', 'pointer');

    const label = svg
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .style('text-anchor', 'middle')
        .attr('fill', primaryColor)
        .text((d) => replaceHtmlEntities(d.label))
        .attr('font-size', 10)
        .attr('dy', '.35em')
        .attr('id', (d) => 'label-' + d.id);

    node.on('click', click);

    node.on('mouseover', function (event, d) {
        d3.select(this).attr('fill', themeColor);
        d3.select('#label-' + d.id)
            .attr('font-weight', 'bold')
            .attr('fill',  primaryColor);

        d3.selectAll('line').attr('stroke', function (line) {
            if (line.source.id === d.id || line.target.id === d.id) {
                return themeColor;
            } else {
                return '#999';
            }
        });

        d3.selectAll('line').attr('stroke-width', function (line) {
            if (line.source.id === d.id || line.target.id === d.id) {
                return 2;
            } else {
                return 1.5;
            }
        });

        d3.selectAll('line').attr('stroke-opacity', function (line) {
            if (line.source.id === d.id || line.target.id === d.id) {
                return 0.5;
            } else {
                return 0.2;
            }
        });

    });

    node.on('mouseout', function (event, d) {
        d3.select(this).attr('fill', secondaryColor);
        d3.select('#label-' + d.id)
            .attr('font-weight', 'normal')
            .attr('fill', primaryColor);
    });

    node.call(
        // @ts-ignore
        d3
            .drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)
    );

    simulation.on('tick', () => {
        link.attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);
        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
        label.attr('x', (d) => d.x).attr('y', (d) => d.y + 18);
    });

    svg.call(
        // @ts-ignore
        d3
            .zoom()
            .extent([
                [-width.value, -height.value],
                [width.value, height.value]
            ])
            .scaleExtent([0.1, 8])
            .on('zoom', zoomed)
    );

    function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    function zoomed({ transform }: any) {
        link.attr('transform', transform);
        node.attr('transform', transform);
        label.attr('transform', transform);
    }

    function click(event: any, d: any) {
        window.location.href = `/termos/${d.slug}`;
    }

    onUnmounted(() => {
        window.removeEventListener('resize', updateDimensions);
        d3.select('#network').selectAll('*').remove();
    });
});
</script>
