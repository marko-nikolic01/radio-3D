#version 330 core

in vec3 FragPos;

uniform vec3 uViewPos;

uniform vec3 uLightPos;
uniform vec3 uLightColor;

uniform float mShine;
uniform vec3 mKA;
uniform vec3 mKD;
uniform vec3 mKS;

uniform vec3 mKE;

out vec4 FragColor;

void main()
{

    vec3 norm = normalize(FragPos - uViewPos);
    vec3 lightDir = normalize(uLightPos - FragPos);

    vec3 ambient = mKA * uLightColor;

    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = mKD * diff * uLightColor;

    vec3 viewDir = normalize(uViewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), mShine);
    vec3 specular = mKS * spec * uLightColor;

    vec3 emissive = mKE;

    vec3 result = ambient + diffuse + specular + emissive;
    FragColor = vec4(result, 1.0);
}