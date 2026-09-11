import torch
from PIL import Image
import open_clip

class OrganClassifier:
    def __init__(self, model_name="ViT-B-32", pretrained="laion2b_s34b_b79k"):
        print(f"Loading OpenCLIP model {model_name}...")
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(model_name, pretrained=pretrained)
        self.tokenizer = open_clip.get_tokenizer(model_name)
        
        # Organs we want to classify
        self.organs = [
            "heart", "lungs", "liver", "kidneys", "spleen", 
            "urinary bladder", "rib cage", "spine"
        ]
        
        self.negative_classes = [
            "a romantic love heart shape",
            "a valentine heart",
            "a generic drawing of a box",
            "a random object",
            "a car",
            "a house",
            "a tree",
            "a person",
            "an animal",
            "a piece of furniture",
            "a landscape"
        ]
        
        # Crafting prompts that account for hand-drawn, animated, or silhouettes
        self.prompts = []
        self.num_prompts_per_organ = 4
        for organ in self.organs:
            self.prompts.extend([
                f"an anatomical illustration of a human {organ} organ",
                f"a medical scan or silhouette of a human {organ}",
                f"a realistic anatomical hand-drawn sketch of a human {organ}",
                f"a clinical medical diagram of a human {organ}"
            ])
            
        self.prompts.extend(self.negative_classes)
            
        self.text_tokens = self.tokenizer(self.prompts)
        
    def predict(self, image_path):
        image = Image.open(image_path).convert("RGB")
        image_input = self.preprocess(image).unsqueeze(0)
        
        with torch.no_grad(), torch.cuda.amp.autocast():
            image_features = self.model.encode_image(image_input)
            text_features = self.model.encode_text(self.text_tokens)
            
            image_features /= image_features.norm(dim=-1, keepdim=True)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            
            text_probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)
            
        # Get the highest probability
        top_idx = text_probs.argmax().item()
        
        # If it matched a negative class, return unknown
        if top_idx >= len(self.organs) * self.num_prompts_per_organ:
            return "unknown"
        
        # Map back to the organ name
        organ_idx = top_idx // self.num_prompts_per_organ
        organ_name = self.organs[organ_idx]
        
        return organ_name

if __name__ == "__main__":
    # Simple test hook
    classifier = OrganClassifier()
    print("Classifier loaded successfully.")
