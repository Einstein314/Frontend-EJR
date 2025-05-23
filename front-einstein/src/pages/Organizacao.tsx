"use client"

import { useState } from "react"

// placeholder imports – replace with your actual filenames
import example1 from "../assets/members/valen.png"
import example2 from "../assets/members/victoria.png"
import example3 from "../assets/members/ema.png"
import example4 from "../assets/members/sofia.png"
import example5 from "../assets/members/seila.png"
import example6 from "../assets/members/VicRusso.png"
import example7 from "../assets/members/ant.png"
import example8 from "../assets/members/isa.png"
import example9 from "../assets/members/pedro.png"
import example10 from "../assets/members/rafab.png"
import example11 from "../assets/members/vit.png"
import example12 from "../assets/members/giovanna.png"

interface OrgPersonProps {
  role: string
  name: string
  description: string
  photo: string
}

function OrgPerson({ role, name, description, photo }: OrgPersonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const widthClass = role === "CONSELHEIRO" ? "w-1/6" : "w-1/5"

  return (
    <div
      className={`flex flex-col items-center relative ${widthClass} px-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-24 h-24 rounded-full overflow-hidden mb-2 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md mx-auto border-2 border-[#0e2a47]">
        <img src={photo} alt={name} className="object-cover w-full h-full" />
      </div>
      <div className="text-center w-full">
        <p className="font-bold text-sm text-[#0e2a47] uppercase pb-2">{role}</p>
        <p className="text-xs text-gray-600">{name}</p>
      </div>
      <div
        className={`absolute z-10 left-1/2 transform -translate-x-1/2 bg-[#0e2a47]/95 border border-gray-200 rounded-md shadow-lg p-4 w-64 top-full mt-2 text-left transition-all duration-300 ease-in-out ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <h3 className="font-bold text-white text-base mb-1">{name}</h3>
        <p className="text-sm text-white font-medium mb-2">{role}</p>
        <p className="text-xs text-white">{description}</p>
      </div>
    </div>
  )
}

function PresidasOrgPerson({ role, name, description, photo }: OrgPersonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="flex flex-col items-center relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-30 h-30 rounded-full overflow-hidden mb-2 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md border-2 border-[#0e2a47]">
        <img src={photo} alt={name} className="object-cover w-full h-full" />
      </div>
      <div className="text-center">
        <p className="font-bold text-sm text-[#0e2a47]">{role}</p>
        <p className="text-xs text-gray-600">{name}</p>
      </div>
      <div
        className={`absolute z-10 left-1/2 transform -translate-x-1/2 bg-[#0e2a47]/95 backdrop-invert backdrop-opacity-10 border border-gray-200 rounded-md shadow-lg p-4 w-64 top-full mt-2 text-left transition-all duration-300 ease-in-out ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <h3 className="font-bold text-white text-base mb-1">{name}</h3>
        <p className="text-sm text-white font-medium mb-2">{role}</p>
        <p className="text-xs text-white">{description}</p>
      </div>
    </div>
  )
}

export default function Organizacao() {
  const presidenteDesc =
    "posição de liderança estratégica, representatividade institucional e gestão organizacional, com foco no desenvolvimento dos membros e no impacto positivo na sociedade e no mercado."
  const conselheiroDesc =
    "Fornece orientação e supervisão para a equipe executiva, ajudando a definir a direção estratégica e garantir a conformidade com as políticas."

  const directors: OrgPersonProps[] = [
    {
      role: "DIRETOR DE MARKETING",
      name: "Vitória Maria Bicego Figueiredo",
      description:
        "Responsável pela gestão das redes sociais e criação de conteúdo, além do desenvolvimento de campanhas e da construção da identidade visual. Atua também na comunicação interna e externa, no planejamento, execução e divulgação de eventos, no contato com fornecedores, na análise de métricas e na definição de estratégias para o fortalecimento da marca.",
      photo: example2,
    },
    {
      role: "DIRETOR DE RH",
      name: "Emanuelle Thomazini Zambom Cícero da Silva",
      description:
        "Responsável por acompanhar a jornada dos membros, desde o recrutamento até o desenvolvimento por meio de capacitações. Atua na comunicação interna, mediação de conflitos e fortalecimento do trabalho em equipe, sempre buscando um ambiente colaborativo. Com base em conhecimentos de gestão de pessoas e no funcionamento da organização, contribui para o alinhamento entre os membros e os objetivos do time, promovendo aprendizados em comunicação, liderança e resolução de problemas.",
      photo: example3,
    },
    {
      role: "DIRETOR DO ADMINISTRATIVO",
      name: "Sofia Tirone Guggisberg",
      description:
        "Responsável parte burocrática e financeira, gerando contratos, termos e documentos. Além de lidar com o financeiro da empresa, por meio de planilhas de controle, precificação de serviços e planejamento. Garante a organização financeira e burocrática da empresa Júnior.",
      photo: example4,
    },
    {
      role: "DIRETOR DE PROJETOS",
      name: "David Drummond Wainstein",
      description:
        "Responsável por garantir qualidade, inovação e impacto no mercado. Com desenvolvimento contínuo, qualidade, inovação e impacto no mercado transformamos desafios em resultados e clientes satisfeitos impulsiona o crescimento da empresa e da sociedade.",
      photo: example5,
    },
    {
      role: "DIRETOR DE COMERCIAL",
      name: "Victor Souza Netto Russo",
      description:
        "Responsável pelo acompanhamento completo da jornada do cliente, desde a captação de possíveis clientes, até fideliza-los. Utiliza estratégias para captar novos clientes, realiza reuniões até o fechamento de um projeto, faz o acompanhamento do projeto com o cliente até o fechamento.  Garante que a empresa esteja com clientes constantemente.",
      photo: example6,
    },
  ]

  const counselors: OrgPersonProps[] = [
    {
      role: "CONSELHEIRO",
      name: "Antonio Bragante Romano",
      description:
        "Oferece suporte estratégico à presidência e contribui para decisões institucionais de alto impacto.",
      photo: example7,
    },
    {
      role: "CONSELHEIRO",
      name: "Isabella Facci Carpi Maçonetto",
      description:
        "Acompanha o direcionamento da entidade e promove boas práticas de gestão e governança.",
      photo: example8,
    },
    {
      role: "CONSELHEIRO",
      name: "Pedro de Siqueira Barone",
      description: conselheiroDesc,
      photo: example9,
    },
    {
      role: "CONSELHEIRO",
      name: "Rafael Brandão Carrera",
      description: conselheiroDesc,
      photo: example10,
    },
    {
      role: "CONSELHEIRO",
      name: "Vitor Bandeira de Mello",
      description: conselheiroDesc,
      photo: example11,
    },
    {
      role: "CONSELHEIRO",
      name: "Giovanna Cerioni Mastrogiuseppe",
      description: conselheiroDesc,
      photo: example12,
    },
  ]

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <h1 className="text-5xl font-regular text-[#0e2a47] mb-12 text-center">
          Organização
        </h1>

        <div className="flex justify-center gap-32 mb-16">
          <PresidasOrgPerson
            role="PRESIDENTE"
            name="Valentina Reitzfeld Garkalns"
            description={presidenteDesc}
            photo={example1}
          />
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#0e2a47] text-center mb-8">
            Diretores
          </h2>
          <div className="flex justify-center w-full max-w-5xl mx-auto px-4">
            {directors.map((d, i) => (
              <OrgPerson key={i} {...d} />
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#0e2a47] text-center mb-8">
            Conselheiros
          </h2>
          <div className="flex justify-center flex-wrap w-full max-w-5xl mx-auto px-4">
            {counselors.map((c, i) => (
              <OrgPerson key={i} {...c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}