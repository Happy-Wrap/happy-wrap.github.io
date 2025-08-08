import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SlideData } from "@/types/presentation";
import { defaultDataSource } from "@/data/defaultItems";
import { RootState } from "@/store/store";
import {
  setDefaultItem,
  addSlide,
  selectSlide,
  updateSlide,
  deleteSlide,
} from "@/store/presentationSlice";

export const usePresentation = () => {
  const dispatch = useDispatch();
  const presentation = useSelector((state: RootState) => state.presentation.presentation);

  useEffect(() => {
    // Load initial item on mount
    defaultDataSource.getItems().then(items => {
      if (items.length > 0) {
        dispatch(setDefaultItem(items[0]));
      }
    });
  }, [dispatch]);

  return {
    presentation,
    addSlide: () => dispatch(addSlide()),
    selectSlide: (slideId: string) => dispatch(selectSlide(slideId)),
    updateSlide: (slideId: string, updates: Partial<SlideData>) => 
      dispatch(updateSlide({ slideId, updates })),
    deleteSlide: (slideId: string) => dispatch(deleteSlide(slideId)),
  };
};