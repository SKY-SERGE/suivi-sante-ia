<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Primitive, type PrimitiveProps } from "reka-ui";
import { cn } from "~/lib/utils";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  disabled: false,
  loading: false,
});
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({ variant, size }),
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'transition-colors',
        props.class
      )
    "
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedBy"
    :aria-disabled="disabled || loading"
  >
    <slot />
  </Primitive>
</template>
