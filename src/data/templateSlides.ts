import { SlideData } from "@/types/presentation";

// Template slides that appear before user-created slides
export const prefixTemplateSlides: SlideData[] = [
  {
    id: "template-welcome",
    type: "template",
    content: {
      imageUrl: "/assets/slides/welcome.png"
    },
    createdAt: new Date()
  },
  {
    id: "template-whyus",
    type: "template",
    content: {
      imageUrl: "/assets/slides/whyus.png"
    },
    createdAt: new Date()
  },
  {
    id: "template-topclients",
    type: "template",
    content: {
      imageUrl: "/assets/slides/topclients.png"
    },
    createdAt: new Date()
  },
  {
    id: "template-steps",
    type: "template",
    content: {
      imageUrl: "/assets/slides/steps.png"
    },
    createdAt: new Date()
  },
  {
    id: "template-requirements",
    type: "template",
    content: {
      imageUrl: "/assets/slides/requirements.png"
    },
    createdAt: new Date()
  }
];

// Template slides that appear after user-created slides
export const suffixTemplateSlides: SlideData[] = [
  {
    id: "template-contactus",
    type: "template",
    content: {
      imageUrl: "/assets/slides/contactus.png"
    },
    createdAt: new Date()
  }
]; 