<template>
  <el-scrollbar class="control-panel">
    <el-form label-position="top">
      <!-- Image Upload -->
      <el-form-item :label="$t('controls.headline')">
        <el-input
          v-model="store.title"
          type="textarea"
          :rows="2"
          placeholder="Enter your headline..."
        />
      </el-form-item>

      <!-- Appearance -->
      <el-form-item :label="$t('controls.background')">
        <div class="color-pickers">
          <el-color-picker
            v-model="store.bgColor1"
            show-alpha
          />
          <el-color-picker
            v-model="store.bgColor2"
            show-alpha
          />
        </div>
      </el-form-item>

      <el-form-item label="Font Size">
        <el-slider
          v-model="store.fontSize"
          :min="80"
          :max="220"
        />
      </el-form-item>

      <!-- Layout -->
      <el-form-item :label="$t('controls.layout')">
        <el-radio-group v-model="store.layout">
          <el-radio-button label="top">
            Top
          </el-radio-button>
          <el-radio-button label="bottom">
            Bottom
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- Device -->
      <el-form-item :label="$t('controls.device')">
        <el-select v-model="store.frameStyle">
          <el-option
            label="iPhone 16 Pro (Black)"
            value="iphone16-jet"
          />
          <el-option
            label="iPhone 16 Pro (Gold)"
            value="iphone16-gold"
          />
          <el-option
            label="iPhone 16 Pro (Silver)"
            value="iphone16-silver"
          />
          <el-option
            label="None"
            value="none"
          />
        </el-select>
      </el-form-item>

      <!-- Upload -->
      <el-form-item label="Screenshot">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
        >
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
        </el-upload>
      </el-form-item>

      <el-button
        type="primary"
        size="large"
        class="export-btn"
        @click="handleExport"
      >
        {{ $t('controls.export') }}
      </el-button>
    </el-form>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { useScreenshotStore } from '../store/screenshot';
import { UploadFile } from 'element-plus';

const store = useScreenshotStore();

const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      store.setProject({ userImage: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }
};

const handleExport = () => {
  // Logic to trigger export from Canvas component
  // We can use a global event or a ref in App.vue
  window.dispatchEvent(new CustomEvent('export-canvas'));
};
</script>

<style scoped>
.control-panel {
  flex: 1;
}
.color-pickers {
  display: flex;
  gap: 10px;
}
.export-btn {
  width: 100%;
  margin-top: 30px;
}
</style>
