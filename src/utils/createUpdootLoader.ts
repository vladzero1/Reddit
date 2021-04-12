import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

export const CreateUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdtoUpdoots: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdtoUpdoots[`${updoot.postId}|${updoot.userId}`] = updoot;
      });

      return keys.map((key) => {
        return updootIdtoUpdoots[`${key.postId}|${key.userId}`];
      });
    }
  );
