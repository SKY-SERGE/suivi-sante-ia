<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  type SelectRootEmits,
  type SelectRootProps,
} from "reka-ui";
import { cn } from "~/lib/utils";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props extends SelectRootProps {
  options: Option[];
  placeholder?: string;
  class?: HTMLAttributes["class"];
  ariaLabel?: string;
}

interface Emits extends SelectRootEmits {}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Sélectionnez une option...",
});

const emits = defineEmits<Emits>();
</script>

<template>
  <SelectRoot
    v-bind="$attrs"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <SelectTrigger
      :class="
        cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-expanded:ring-2 aria-expanded:ring-ring aria-expanded:ring-offset-2',
          props.class
        )
      "
      :aria-label="ariaLabel"
    >
      <SelectValue :placeholder="placeholder" />
      <Icon name="lucide:chevron-down" class="h-4 w-4 opacity-50 shrink-0" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
        position="popper"
        side="bottom"
        :side-offset="4"
      >
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <span
              class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
            >
              <Icon
                name="lucide:check"
                class="h-4 w-4 opacity-0 data-[state=checked]:opacity-100"
              />
            </span>
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
