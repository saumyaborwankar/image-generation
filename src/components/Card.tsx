import { useEffect, useState } from "react";
import { openai } from "../util/openai";
import data from "../../data.json";
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Row,
  Skeleton,
  Tabs,
  Upload,
  type UploadProps,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
interface Props {
  setAllImages: React.Dispatch<React.SetStateAction<string[]>>;
}
export const CardComponent = (props: Props) => {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [cache, setCache] = useState<{ prompt: string; response: string[] }[]>(
    []
  );

  //loading cache on mount
  // useEffect(() => {
  //   const cacheStored = localStorage.getItem("cache");
  //   if (cacheStored) {
  //     setCache(JSON.parse(cacheStored as string));
  //   }
  // }, []);

  //updating cache everytime the user searches for new prompt
  // useEffect(() => {
  //   localStorage.setItem("cache", JSON.stringify(cache));
  // }, [cache]);

  const fetchResponses = async () => {
    setLoading(true);
    const cacheHit = cache.find((item) => item.prompt === prompt);
    if (cacheHit) {
      //assuming the user is okay with a cached response and does not want to generate new one with the same response
      console.log("found from cache");
      setImages(cacheHit.response);
      setLoading(false);
      return;
    }

    try {
      let responseData: any;

      // IF a file is uploaded, we will use the edit endpoint
      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("image[]", file));
        formData.append("model", "gpt-image-1");
        formData.append("prompt", prompt);

        try {
          const response = await fetch(
            "https://api.openai.com/v1/images/edits",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
              },
              body: formData,
            }
          );

          responseData = await response.json();
        } catch (err) {
          console.error("Edit API error:", err);
        }
      } else {
        // If no file is uploaded, we will use the generate endpoint
        try {
          responseData = await openai.images.generate({
            model: "gpt-image-1",
            prompt,
            n: numberOfImages,
          });
        } catch (err) {
          console.error("Generate API error:", err);
        }
      }

      if (responseData?.data && responseData.data.length > 0) {
        const newImages = responseData.data
          .map((image: { b64_json: string }) => image.b64_json)
          .filter(Boolean) as string[];

        setImages(newImages);
        props.setAllImages((prev) => [...prev, ...newImages]);
        setCache((prev) => [...prev, { prompt, response: newImages }]);
      }

      // setTimeout(() => {
      //   console.log("Fetching from API");
      //   setImages([
      //     "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=",
      //   ]);
      //   setCache([
      //     ...cache,
      //     {
      //       prompt,
      //       response:
      //         "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=",
      //     },
      //   ]);
      //   setLoading(false);
      // }, 2000);
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };

  const handleInput = (e: any) => {
    setPrompt(e.target.value);
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    headers: {
      authorization: "authorization-text",
    },
    customRequest: ({ file, onSuccess }) => {
      setFiles([file as RcFile]);
      onSuccess && onSuccess("ok", new XMLHttpRequest());
    },
  };

  return (
    <Card title="Image Generation">
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form layout="vertical">
            <Form.Item label="Enter your prompt">
              <Input
                onChange={handleInput}
                placeholder="Kitty eating ice cream"
              />
            </Form.Item>

            <Form.Item label="Add a reference image">
              <Upload {...uploadProps} listType="picture">
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>

            <Form.Item label="Number of Images to generate:">
              <InputNumber
                disabled={files.length > 0}
                min={1}
                max={10}
                defaultValue={1}
                onChange={(value: number | null) =>
                  value ? setNumberOfImages(value) : null
                }
              />
            </Form.Item>
            <Form.Item>
              <Button onClick={fetchResponses} type="primary" block>
                Generate
              </Button>
            </Form.Item>
          </Form>
        </Col>

        <Col xs={24} md={12}>
          <Card
            size="small"
            title="Generated Images"
            style={{ minHeight: 250, overflowY: "auto" }}
          >
            {!loading ? (
              images.length > 0 ? (
                <Image.PreviewGroup>
                  <Row gutter={[16, 16]}>
                    {images.map((image, index) => (
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
              ) : (
                <div style={{ textAlign: "center", color: "#888" }}>
                  Submit a prompt to generate images
                </div>
              )
            ) : (
              <Skeleton.Image active style={{ width: 150, height: 150 }} />
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );
};
