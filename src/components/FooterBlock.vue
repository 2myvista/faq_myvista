<!-- src/components/FooterBlock.vue -->
<template>
	<footer class="app-footer">
		<div class="status-info">
			<span v-if="notesStore.isLoading" class="loading-status">
				⏳ Загрузка данных...
			</span>
			<span v-else class="ready-status">
				✅ Готово
			</span>
		</div>

		<div class="global-stats">
			Всего заметок: {{ notesStore.totalNotes }} | Тегов: {{ notesStore.totalTags }}
		</div>
	</footer>
</template>

<script setup lang="ts">

	import { useNotesStore } from '../stores/notes'

	const notesStore = useNotesStore()
	
</script>

<style scoped>
/* Футер */
.app-footer {
	padding: 0.5rem 1rem;
	background: white;
	border-top: 1px solid #dee2e6;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 0.85rem;
	color: #6c757d;
}

.status-info {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.loading-status {
	color: #e74c3c;
	display: flex;
	align-items: center;
	gap: 0.25rem;
}

.ready-status {
	color: #27ae60;
	display: flex;
	align-items: center;
	gap: 0.25rem;
}

.global-stats {
	font-weight: 500;
}
</style>