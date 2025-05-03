import { useEffect, useState } from "react";
import axios from "axios";

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    axios.get("/api/featureFlags").then((response) => {
      const map: { [key: string]: boolean } = {};
      response.data.forEach((flag: any) => {
        map[flag.feature_name] = flag.is_enabled;
      });
      setFlags(map);
    });
  }, []);

  return flags;
};