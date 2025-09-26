import { Card, Col, Image, Row, Skeleton } from "antd";
import { useEffect, useState } from "react";
interface Props {
  allImages: string[];
}
export const History = (props: Props) => {
  //loading images from cache
  //   const [images, setImages] = useState<string[]>([]);
  //   useEffect(() => {
  //     const cacheStored = localStorage.getItem("cache");

  //     if (cacheStored) {
  //       const allImages = JSON.parse(cacheStored as string).flatMap(
  //         (item: { response: string[] }) => item.response
  //       );
  //       setImages(allImages);
  //     }
  //   }, []);

  return (
    <Card
      size="small"
      title="Previously generated Images"
      style={{ minHeight: 250, overflowY: "auto" }}
    >
      {props.allImages.length > 0 && (
        <Image.PreviewGroup>
          <Row gutter={[16, 16]}>
            {props.allImages.map((image, index) => (
              <Col key={index}>
                <Image
                  src={`data:image/png;base64,${image}`}
                  alt={`Generated ${index}`}
                  width={150}
                  height={150}
                  style={{
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              </Col>
            ))}
          </Row>
        </Image.PreviewGroup>
      )}
    </Card>
  );
};
