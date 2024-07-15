#version 330 core


uniform vec3 lPos;
uniform vec3 lKA;
uniform vec3 lKD;
uniform vec3 lKS;


uniform sampler2D mKD;
uniform vec3 mKS;
uniform float mShine;

in vec3 chNor;
in vec3 chFragPos;
in vec2 chText;

out vec4 outCol;

uniform vec3 uViewPos;

void main()
{
	vec3 resA = lKA * texture(mKD, chText).rgb;

	vec3 normal = normalize(chNor);
	vec3 lightDirection = normalize(lPos - chFragPos);
	float nD = max(dot(normal, lightDirection), 0.0);
	vec3 resD = lKD * ( nD * texture(mKD, chText).rgb);

	vec3 viewDirection = normalize(uViewPos - chFragPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float s = pow(max(dot(viewDirection, reflectionDirection), 0.0), mShine);
	vec3 resS = lKS * (s * mKS);

	outCol = vec4(resA + resD + resS, 1.0);
}