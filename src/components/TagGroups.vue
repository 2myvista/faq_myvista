<!-- src/components/TagGroups.vue -->
<template>
  <div class="tag-groups">
    <div
      v-for="(groupTags, groupName) in groupedTags"
      :key="groupName"
      class="tag-group"
    >
      <h4>{{ groupName }}</h4>
      <div class="group-tags">
        <span
          v-for="tag in groupTags"
          :key="tag.full"
          :class="['group-tag', { 'active': selectedTag === tag.full }]"
          @click="$emit('select-tag', tag.full)"
          :title="tag.full"
        >
          {{ tag.display }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GroupedTags } from '../types/treeItem'

interface Props {
  groupedTags: GroupedTags
  selectedTag?: string | null
}

defineProps<Props>()

defineEmits<{
  (e: 'select-tag', tag: string): void
}>()
</script>

<style scoped>
.tag-groups {
  max-height: 400px;
  overflow-y: auto;
}

.tag-group {
  margin-bottom: 15px;
}

.tag-group h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.group-tag {
  padding: 3px 8px;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-tag:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.group-tag.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}
</style>