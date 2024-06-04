<template>
    <div class="mt-5 md:mx-auto min-h-[60vh] w-full rounded-tl overflow-hidden">
        <h1 class="text-4xl pb-8 text-center md:text-5xl font-bold">Mapa de relacionamento</h1>

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
// TODO: How to handle large networks? Limit the number of nodes and links? Randomize the nodes?
import * as d3 from 'd3';

const blue = '#6699ff';
const green = '#a9cc44';

const conceptStore = useConceptStore();
const { conceptsNetwork: concepts } = storeToRefs(conceptStore);

if (!concepts.value || concepts.value.length === 0) {
    await conceptStore.fetchNetwork();
}

const nodeMapSize = new Map();
const nodes = [] as {
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
    nodes.push({
        id: concept.id,
        label: concept.name,
        slug: concept.nameSlug,
        value: nodeSize
    });

    concept.concepts?.forEach((child) => {
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
            distance: 75 + Math.random() * 50
        });
    });

    concept.relatedConcepts?.forEach((related) => {
        nodeMapSize.set(
            concept.id,
            (nodeMapSize.get(concept.id) || nodeSize) + nodeGap
        );
        nodeMapSize.set(
            related.id,
            (nodeMapSize.get(related.id) || nodeSize) + nodeGap
        );
    });
});

nodes.forEach((node) => {
    node.value = nodeMapSize.get(node.id) || nodeSize;
});

const data = {
    nodes,
    links
};

const width = ref(0);
const height = ref(0);
const viewBox = ref([0, 0, 0, 0]) as Ref<number[]>;

onMounted(() => {
    const updateDimensions = () => {
        const networkDiv = document.getElementById('network')!;
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
                .distance((d) => d.distance)
        )
        .force('charge', d3.forceManyBody().strength(-60))
        .force('center', d3.forceCenter())
        .force('y', d3.forceY().strength(0.03));

    const svg = d3.select('#network-svg');

    const link = svg
        .append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll()
        .data(links)
        .join('line')
        .attr('stroke-width', 1.5);

    d3.line().curve(d3.curveBasis);

    const node = svg
        .append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .selectAll()
        .data(nodes)
        .join('circle')
        .attr('r', (d) => Math.sqrt(d.value) * 3)
        .attr('fill', blue)
        .attr('cursor', 'pointer');

    const label = svg
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .style('text-anchor', 'middle')
        .attr('fill', 'gray')
        .text((d) => d.label)
        .attr('font-size', 10)
        .attr('dy', '.35em')
        .attr('id', (d) => 'label-' + d.id);

    node.on('click', click);

    node.on('mouseover', function (event, d) {
        d3.select(this).attr('fill', green);
        d3.select('#label-' + d.id)
            .attr('font-weight', 'bold')
            .attr('fill', green);
    });
    node.on('mouseout', function (event, d) {
        d3.select(this).attr('fill', blue);
        d3.select('#label-' + d.id)
            .attr('font-weight', 'normal')
            .attr('fill', 'gray');
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
