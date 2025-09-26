import { Card, Col, Image, Row, Skeleton, Typography } from "antd";
import { useEffect, useState } from "react";
const { Text } = Typography;
interface Props {
  generatedImages: { prompt: string; image: string }[];
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
      {props.generatedImages.length > 0 && (
        <Image.PreviewGroup>
          <Row gutter={[16, 16]}>
            {props.generatedImages.map((image, index) => (
              <Col key={index} style={{ textAlign: "center" }}>
                <Image
                  src={`data:image/png;base64,${image.image}`}
                  alt={`Generated ${index}`}
                  width={150}
                  height={150}
                  style={{
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <Text
                  style={{
                    display: "block",
                    marginTop: 8,
                    maxWidth: 150,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={props.generatedImages[index].prompt}
                >
                  {props.generatedImages[index].prompt}
                </Text>
              </Col>
            ))}
          </Row>
        </Image.PreviewGroup>
      )}
    </Card>
  );
};
