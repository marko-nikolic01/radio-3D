#version 330 core
out vec4 FragColor;

struct Material {
	vec3 kA;
	vec3 kD;
	vec3 kS;
    float shine;
}; 

struct DirLight {
    vec3 dir;
	vec3 kA;
	vec3 kD;
	vec3 kS;
};

struct PointLight {
    vec3 pos;
    
    float constant;
    float linear;
    float quadratic;
	
	vec3 kA;
	vec3 kD;
	vec3 kS;
};

struct SpotLight {
    vec3 pos;
    vec3 dir;

    float cutOff;
    float outerCutOff;
  
    float constant;
    float linear;
    float quadratic;
  
	vec3 kA;
	vec3 kD;
	vec3 kS;   
};

#define NR_POINT_LIGHTS 1
#define NR_DIRECTIONAL_LIGHTS 1

in vec3 chFragPos;
in vec3 chNor;

uniform vec3 uViewPos;
uniform DirLight uDirLights[NR_DIRECTIONAL_LIGHTS];
uniform PointLight uPointLights[NR_POINT_LIGHTS];
uniform SpotLight uSpotLight;
uniform Material uMaterial;

uniform bool hasPointLight = false;
uniform bool hasSpotLight = false;

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{    
    vec3 norm = normalize(chNor);
    vec3 viewDir = normalize(uViewPos - chFragPos);

    vec3 result = vec3(0.0f);
    for(int i = 0; i < NR_DIRECTIONAL_LIGHTS; i++)
    {
        result += CalcDirLight(uDirLights[i], norm, viewDir);
    }

    if(hasPointLight)
    {
        result += CalcPointLight(uPointLights[0], norm, chFragPos, viewDir);
    }

    if(hasSpotLight)
    {
        result += CalcSpotLight(uSpotLight, norm, chFragPos, viewDir); 
    }  
    
    FragColor = vec4(result, 1.0);
}

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir)
{
    vec3 lightDir = normalize(-light.dir);

    float diff = max(dot(normal, lightDir), 0.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shine);

    vec3 ambient = light.kA * uMaterial.kA;
    vec3 diffuse = light.kD * diff * uMaterial.kD;
    vec3 specular = light.kS * spec * uMaterial.kS;
    return ambient + diffuse + specular;
}

vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.pos - fragPos);

    float diff = max(dot(normal, lightDir), 0.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shine);

    float distance = length(light.pos - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

    vec3 ambient = light.kA * uMaterial.kA;
    vec3 diffuse = light.kD * diff * uMaterial.kD;
    vec3 specular = light.kS * spec * uMaterial.kS;
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}


vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.pos - fragPos);

    float diff = max(dot(normal, lightDir), 0.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shine);

    float distance = length(light.pos - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

    float theta = dot(lightDir, normalize(-light.dir)); 
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    vec3 ambient = light.kA * uMaterial.kA;
    vec3 diffuse = light.kD * diff * uMaterial.kD;
    vec3 specular = light.kS * spec * uMaterial.kS;
    ambient *= attenuation * intensity;
    diffuse *= attenuation * intensity;
    specular *= attenuation * intensity;
    return (ambient + diffuse + specular);
}