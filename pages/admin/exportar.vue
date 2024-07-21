<template>
    <UICardContainer>
        <template #header>
            <UIAnchorReturn href="/admin" />
            <UIContainerTitle>Exportar</UIContainerTitle>
        </template>
        <UIExport :public="false" />
    </UICardContainer>
</template>