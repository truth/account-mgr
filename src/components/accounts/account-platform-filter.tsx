"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "antd";

type AccountPlatformFilterProps = {
  value?: string;
  options: Array<{ label: string; value: string }>;
};

export function AccountPlatformFilter({ value, options }: AccountPlatformFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      value={value}
      allowClear
      placeholder="按平台筛选"
      options={options}
      onChange={(nextValue) => {
        const params = new URLSearchParams(searchParams.toString());

        if (nextValue) {
          params.set("platformId", nextValue);
        } else {
          params.delete("platformId");
        }

        const query = params.toString();
        router.push(query ? `/accounts?${query}` : "/accounts");
      }}
    />
  );
}
