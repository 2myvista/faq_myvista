<!-- src/components/TagCloud.vue -->
<template>
  <div class="tag-cloud">
    <div class="tags-list">
      <span
        v-for="tag in tags"
        :key="tag"
        :class="['tag', { 'active': selectedTag === tag }]"
        @click="$emit('select-tag', tag)"
        :title="tag"
      >
        #{{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  tags: string[]
  selectedTag?: string | null
}

defineProps<Props>()

defineEmits<{
  (e: 'select-tag', tag: string): void
}>()
</script>

<style scoped>
.tag-cloud {
  max-height: 300px;
  overflow-y: auto;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  background: #e9ecef;
  color: #495057;
  border-radius: 15px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.tag:hover {
  background: #dee2e6;
  transform: translateY(-1px);
}

.tag.active {
  background: #007bff;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
}
</style>