"use client";

import React from "react";
import { SchemaDietClient } from "@/components/tools/SchemaDietClient";

export default function InAppSchemaDietPage() {
  return <SchemaDietClient inApp={true} />;
}
