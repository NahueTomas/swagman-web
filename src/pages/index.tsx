import { useState } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";

import { escapeUrl } from "@/utils/helpers";

export default function IndexPage() {
  const [specificationLink, setSpecificationLink] = useState<string>("");

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Card>
        <CardHeader>
          <h1>Insert your openapi specification</h1>
        </CardHeader>
        <Divider />
        <CardBody>
          <Input
            label="Specification URL"
            onChange={(e) => setSpecificationLink(e.target.value)}
          />
        </CardBody>
        <CardFooter>
          <Button
            as={Link}
            color="primary"
            href={`/specification/${escapeUrl(specificationLink)}`}
            isDisabled={!specificationLink}
          >
            Go to specification
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
